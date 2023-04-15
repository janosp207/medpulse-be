import Env from '@ioc:Adonis/Core/Env'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Patient from 'App/Models/Patient'
import PatientActivity from 'App/Models/PatientActivity'
import PatientMeasurement from 'App/Models/PatientMeasurement'
import axios from 'axios'
import { DateTime } from 'luxon'

enum MeasurementType {
  Weight = 1,
  Height = 4,
  FatRatio = 6,
}

const convertDateTimeToTimestamp = (date: DateTime, daysToAdd = 0 as number) => {
  const stringDate = date.toString()

  const newDate = new Date(stringDate) // add 2 days to date
  newDate.setDate(newDate.getDate())

  const unixTimestamp = Math.floor(new Date(stringDate).getTime() / 1000 + daysToAdd * 86400)
  return unixTimestamp
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

      console.log('Activity synced successfully')
      return response.status(200).send('Activity synced successfully')
    } catch (error) {
      response.status(500).send('Error fetching data from Withings API')
    }
  }
}

module.exports = WithingsController
