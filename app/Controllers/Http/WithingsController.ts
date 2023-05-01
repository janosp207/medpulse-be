import Env from '@ioc:Adonis/Core/Env'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Patient from 'App/Models/Patient'
import PatientActivity from 'App/Models/PatientActivity'
import PatientMeasurement from 'App/Models/PatientMeasurement'
import PatientSleepHeartRate from 'App/Models/PatientSleepHeartRate'
import PatientSleepLog from 'App/Models/PatientSleepLog'
import PatientSleepState from 'App/Models/PatientSleepState'
import PatientSleepSummary from 'App/Models/PatientSleepSummary'
import { MeasurementType } from 'App/enums'
import axios from 'axios'
import { DateTime } from 'luxon'

const convertDateTimeToTimestamp = (date: DateTime, daysToAdd = 0 as number) => {
  const stringDate = date.toString()

  const newDate = new Date(stringDate) // add 2 days to date
  newDate.setDate(newDate.getDate())

  const unixTimestamp = Math.floor(new Date(stringDate).getTime() / 1000 + daysToAdd * 86400)
  return unixTimestamp
}

const getSleepTimeStamps = () => {
  //get yesterdays date at 8 PM
  const startdate = DateTime.now().minus({ days: 1 }).set({ hour: 18, minute: 0, second: 0 })
  const enddate = DateTime.now().set({ hour: 14, minute: 0, second: 0 })
  return {
    startdate: convertDateTimeToTimestamp(startdate),
    enddate: convertDateTimeToTimestamp(enddate),
  }
}
export default class WithingsController {
  public async callback({ request, response }: HttpContextContract) {
    const code = request.input('code')
    const url = 'https://wbsapi.withings.net/v2/oauth2'
    try {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
      const data = {
        action: 'requesttoken',
        client_id: Env.get('CLIENT_ID'),
        client_secret: Env.get('SECRET'),
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3333/callback',
      }

      const apiResponse = await axios.post(url, data, { headers })

      const {
        userid,
        refresh_token: refreshToken,
        access_token: accessToken,
        expires_in: expiresIn,
      } = apiResponse.data.body

      const expiresAt = DateTime.now().plus({ seconds: expiresIn })

      //check if user exists in database
      const patient = await Patient.findBy('user_id', userid)

      if (patient) {
        //update patient
        patient.refresh_token = refreshToken
        patient.access_token = accessToken
        patient.expires_at = expiresAt
        await patient.save()
      } else {
        //create patient
        await Patient.create({
          user_id: userid,
          refresh_token: refreshToken,
          access_token: accessToken,
          expires_at: expiresAt,
        })
      }

      return userid
    } catch (error) {
      console.error(error)
      response.status(500).send('Error fetching data from Withings API')
    }
  }

  public async storeAccessTokenByUserId({ session, request, response }: HttpContextContract) {
    const userId = request.input('userId')
    const patient = await Patient.findBy('user_id', userId)

    if (patient) {
      const { access_token: accessToken, expires_at: expiresAt } = patient
      session.put('accessToken', accessToken)
      session.put('userid', userId)
      session.put('expiresAt', expiresAt)

      return response.json({ body: { accessToken } })
    } else {
      response.status(404).send('Patient not found')
    }
  }

  public async syncActivity({ session, response }: HttpContextContract) {
    const token = session.get('accessToken')
    const userId = session.get('userid')
    const url = 'https://wbsapi.withings.net/v2/measure'
    let lastupdate = 0

    //check for latest user activity
    const latestActivity = await PatientActivity.query()
      .where('patient_id', userId)
      .orderBy('date', 'desc')
      .first()

    if (latestActivity) {
      const { date } = latestActivity

      lastupdate = convertDateTimeToTimestamp(date)
    }

    try {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      }
      const data = {
        action: 'getactivity',
        lastupdate: lastupdate,
      }

      const apiResponse = await axios.post(url, data, { headers })

      if (apiResponse.data.body.activities.length > 0) {
        // create new activities for user
        apiResponse.data.body.activities.forEach(async (activity: any) => {
          await PatientActivity.updateOrCreate(
            { patient_id: userId, date: activity.date },
            {
              patient_id: userId,
              date: activity.date,
              steps: activity.steps,
              distance: activity.distance,
              elevation: activity.elevation,
              soft: activity.soft,
              moderate: activity.moderate,
              intense: activity.intense,
              active: activity.active,
              calories: activity.calories,
              totalcalories: activity.totalcalories,
            }
          )
        })
      }

      console.log('activity synced successfully')

      //sync measurements
      const measureUrl = 'https://wbsapi.withings.net/measure'
      lastupdate = 0

      const latestWeightMeasurement = await PatientMeasurement.query()
        .where('patient_id', userId)
        .orderBy('date', 'desc')
        .first()

      if (latestWeightMeasurement) {
        const { date } = latestWeightMeasurement

        lastupdate = date
      }

      const measurementData = {
        action: 'getmeas',
        lastupdate: lastupdate,
        meastypes: `${MeasurementType.Weight},${MeasurementType.Height},${MeasurementType.FatRatio}`,
      }

      const measurementResponse = await axios.post(measureUrl, measurementData, { headers })
      const measurements = measurementResponse.data.body.measuregrps

      if (measurements.length > 0) {
        // create new measurements for user
        measurements.forEach(async (measurement: any) => {
          const { date, measures } = measurement

          measures.forEach(async (measure: any) => {
            const { value, type, unit } = measure

            await PatientMeasurement.updateOrCreate(
              { patient_id: userId, date: date, type: type },
              {
                patient_id: userId,
                date: date,
                type: type,
                value: parseFloat((value * Math.pow(10, unit)).toFixed(2)),
              }
            )
          })
        })
      }
      console.log('measurements synced successfully')

      const { startdate, enddate } = getSleepTimeStamps()

      const sleepRequestUrl = 'https://wbsapi.withings.net/v2/sleep'
      //heart rate fetching
      const sleepStatesData = {
        action: 'get',
        data_fields: 'hr',
        startdate: startdate,
        enddate: enddate,
      }
      const sleepResponseData: any[] = []

      while (startdate < enddate) {
        const sleepResponse = await axios.post(sleepRequestUrl, sleepStatesData, { headers })
        if (sleepResponse.data.body.series.length === 0) {
          break
        }
        sleepResponseData.push(...sleepResponse.data.body.series)

        sleepStatesData.startdate =
          sleepResponse.data.body.series[sleepResponse.data.body.series.length - 1].enddate
      }

      if (sleepResponseData.length > 0) {
        //create sleep log, use starttime of first sleep state as date and endtime of last sleep state as enddate from sleepresponsedata
        const sleepLog = await PatientSleepLog.updateOrCreate(
          { patientId: userId, startdate: sleepResponseData[0].startdate },
          {
            patientId: userId,
            startdate: sleepResponseData[0].startdate,
            enddate: sleepResponseData[sleepResponseData.length - 1].enddate,
          }
        )

        // create new measurements for user
        sleepResponseData.forEach(async (sleep: any) => {
          const { startdate, enddate, state, hr } = sleep

          const createdSleepState = await PatientSleepState.updateOrCreate(
            { sleepId: sleepLog.id, startdate: startdate },
            {
              sleepId: sleepLog.id,
              startdate: startdate,
              enddate: enddate,
              state: state,
            }
          )

          if (hr) {
            Object.keys(hr).forEach(async (timestamp: any) => {
              await PatientSleepHeartRate.updateOrCreate(
                { sleepStateId: createdSleepState.id, timestamp: timestamp },
                {
                  sleepStateId: createdSleepState.id,
                  timestamp: timestamp,
                  hr: hr[timestamp],
                }
              )
            })
          }
        })
      }

      console.log('sleep logs synced successfully')

      let latestSleepSummary = await PatientSleepSummary.query()
        .where('patient_id', userId)
        .orderBy('startdate', 'desc')
        .first()

      lastupdate = 0

      if (latestSleepSummary) {
        const { startdate } = latestSleepSummary

        lastupdate = startdate
      }

      //sync sleep summaries
      const sleepSummaryData = {
        action: 'getsummary',
        data_fields:
          'hr_average,hr_min,hr_max,sleep_efficiency,sleep_latency,total_sleep_time,sleep_score,apnea_hypopnea_index',
        lastupdate: lastupdate,
      }

      //do it in a loop, while there are more sleep summaries
      const sleepSummaries: any[] = []

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const sleepSummaryResponse = await axios.post(sleepRequestUrl, sleepSummaryData, {
          headers,
        })
        if (sleepSummaryResponse.data.body.more === false) {
          sleepSummaries.push(...sleepSummaryResponse.data.body.series)
          break
        }
        sleepSummaries.push(...sleepSummaryResponse.data.body.series)
        sleepSummaryData.lastupdate =
          sleepSummaryResponse.data.body.series[
            sleepSummaryResponse.data.body.series.length - 1
          ].startdate
      }

      if (sleepSummaries.length > 0) {
        // create new measurements for user
        sleepSummaries.forEach(async (sleepSummary: any) => {
          await PatientSleepSummary.updateOrCreate(
            { patientId: userId, startdate: sleepSummary.startdate },
            {
              patientId: userId,
              startdate: sleepSummary.startdate,
              enddate: sleepSummary.enddate,
              hrAverage: sleepSummary.data.hr_average,
              hrMin: sleepSummary.data.hr_min,
              hrMax: sleepSummary.data.hr_max,
              sleepEfficiency: sleepSummary.data.sleep_efficiency,
              sleepLatency: sleepSummary.data.sleep_latency,
              totalSleepTime: sleepSummary.data.total_sleep_time,
              sleepScore: sleepSummary.data.sleep_score,
              ahi: sleepSummary.data.apnea_hypopnea_index || 0,
            }
          )
        })
      }

      console.log('sleep summary synced successfully')
      console.log('syncing withings data completed successfully')
      return response.status(200).send('Activity synced successfully')
    } catch (error) {
      response.status(500).send('Error fetching data from Withings API')
    }
  }
}

module.exports = WithingsController
