import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Patient from 'App/Models/Patient'
import PatientActivity from 'App/Models/PatientActivity'
import PatientLimit from 'App/Models/PatientLimit'
import PatientMeasurement from 'App/Models/PatientMeasurement'
import PatientSleepSummary from 'App/Models/PatientSleepSummary'
import PatientWellnessRating from 'App/Models/PatientWellnessRating'
import PatientsBloodOxygen from 'App/Models/PatientsBloodOxygen'
import PatientsBloodPressure from 'App/Models/PatientsBloodPressure'
import { MeasurementType } from 'App/enums'
import * as ss from 'simple-statistics'

const calculateSlope = (values: number[]) => {
  const { m: slope } = ss.linearRegression(values.map((d, i) => [i, d]))
  return slope
}

const calculateVariance = (values: number[]) => {
  return ss.variance(values)
}

const getWellnesTextFromVariance = (variance: number, median: number) => {
  let medianText = ''
  if (median < 3) {
    medianText = 'Low wellness. '
  } else if (median < 4) {
    medianText = 'Medium wellness. '
  } else {
    medianText = 'High wellness. '
  }

  if (variance < 0.5) {
    return medianText + 'Stable and consistent symptoms.'
  }
  if (variance < 1.5) {
    return median + 'Fluctuating symptoms, under control.'
  }
  return median + 'Highly variable and unstable symptoms, may need further attention.'
}

const calculateSleepApneaStdDev = (values: number[]) => {
  return ss.standardDeviation(values)
}

const getSleepApneaTextFromStdDev = (vals: number[]) => {
  const stdDev = calculateSleepApneaStdDev(vals)
  let multiplier = 1
  const avarage = ss.mean(vals)

  if (stdDev > 10) {
    multiplier = 0.8
  }
  if (stdDev > 20) {
    multiplier = 0.5
  }

  if (avarage < 5 * multiplier) {
    return 'Normal sleep apnea.'
  }
  if (stdDev < 15 * multiplier) {
    return 'Mild sleep apnea.'
  }
  if (stdDev < 30 * multiplier) {
    return 'Moderate sleep apnea.'
  }
  return 'Severe sleep apnea.'
}

export default class PatientsController {
  public async index({ response }: HttpContextContract) {
    //return id and name of all patients
    const patients = await Patient.query().select('user_id', 'name', 'date_of_birth')

    return response.status(200).json(patients)
  }

  public async warnings({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const userId = session.get('userid')

    const limits = await PatientLimit.query().where('patient_id', userId).first()

    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - 1)
    const enddate = new Date()

    const startTime = Math.floor(startDate.getTime() / 1000)
    const endTime = Math.floor(enddate.getTime() / 1000)

    const warnings = [] as any

    const weights = await PatientMeasurement.query()
      .where('patient_id', userId)
      .where('type', MeasurementType.Weight)
      .whereBetween('date', [startTime, endTime])
      .orderBy('date', 'asc')
    const latestWeight = weights[weights.length - 1]

    if (!limits) {
      return response.status(400).json({ message: 'Limits not set' })
    }

    const weightWarning = {
      type: 'weight',
      value: latestWeight?.value,
      slope: calculateSlope(weights.map((weight) => weight.value)),
      isWithinLimits:
        latestWeight?.value <= limits?.weight && latestWeight?.value >= limits?.weightMin,
    }

    //check how many times did patient suffer hypotension
    const hypotensionCount = await PatientsBloodPressure.query()
      .where('patient_id', userId)
      .where('systolic', '<=', limits.systolicMin)
      .orWhere('diastolic', '<=', limits.diastolicMin)
      .whereBetween('created_at', [startDate, enddate])
      .count('*')
      .first()

    const hypotensionWarning = {
      type: 'hypotension',
      value: hypotensionCount?.$extras.count || 0,
      isTrendWarning: false,
    }

    //same for hypertension
    const hypertensionCount = await PatientsBloodPressure.query()
      .where('patient_id', userId)
      .where('systolic', '>=', limits.systolicMax)
      .orWhere('diastolic', '>=', limits.diastolicMax)
      .whereBetween('created_at', [startDate, enddate])
      .count('*')
      .first()

    const hypertensionWarning = {
      type: 'hypertension',
      value: hypertensionCount?.$extras.count || 0,
      isTrendWarning: false,
    }

    //hypoxemia
    const hypoxemiaCount = await PatientsBloodOxygen.query()
      .where('patient_id', userId)
      .where('blood_oxygen', '<=', limits.bloodOxygenMin / 100)
      .whereBetween('created_at', [startDate, enddate])
      .count('*')
      .first()

    const hypoxemiaWarning = {
      type: 'hypoxemia',
      value: hypoxemiaCount?.$extras.count || 0,
      isTrendWarning: false,
    }

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const sixMonthsAgoTime = Math.floor(sixMonthsAgo.getTime() / 1000)

    const weightsSixMonthsAgo = await PatientMeasurement.query()
      .where('patient_id', userId)
      .where('type', MeasurementType.Weight)
      .whereBetween('date', [sixMonthsAgoTime, endTime])
      .orderBy('date', 'asc')

    const weightLoss = (weightsSixMonthsAgo[0].value - latestWeight.value) / latestWeight.value

    //cachexia
    if (weightLoss > 0.04) {
      warnings.push({
        type: 'cachexia',
        value: weightLoss,
        isTrendWarning: false,
        text: 'Indication of cachexia!',
      })
    }

    //sleep apnea
    const sleepSummaries = await PatientSleepSummary.query()
      .select('patient_id', 'startdate', 'ahi')
      .where('patient_id', userId)
      .whereBetween('startdate', [startTime, endTime])
      .orderBy('startdate', 'asc')

    const ahi = sleepSummaries.map((summary) => summary.ahi)

    const sleepApneaWarning = {
      type: 'sleep apnea',
      isTrendWarning: false,
      value: ss.standardDeviation(ahi),
      text: getSleepApneaTextFromStdDev(ahi),
    }

    // wellness check
    const wellness = await PatientWellnessRating.query()
      .where('patient_id', userId)
      .whereBetween('created_at', [startDate, enddate])
      .orderBy('created_at', 'asc')

    //get variance from rating and overall rating
    const variance = calculateVariance(
      wellness.map((wellness) => (wellness.rating + wellness.overallRating) / 2)
    )
    const median = ss.median(
      wellness.map((wellness) => (wellness.rating + wellness.overallRating) / 2)
    )

    const wellnessWarning = {
      type: 'wellness',
      value: median,
      isTrendWarning: false,
      text: getWellnesTextFromVariance(variance, median),
    }

    warnings.push(weightWarning)
    warnings.push(hypotensionWarning)
    warnings.push(hypertensionWarning)
    warnings.push(hypoxemiaWarning)
    warnings.push(sleepApneaWarning)
    warnings.push(wellnessWarning)

    return response.status(200).json(warnings)
  }

  public async wellness({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    //just log the 1 to 5 values from request to database
    const userId = session.get('userid')

    //get "rating" and "overall_rating" from request
    const { rating, overallRating } = request.all()

    //create new wellness entry
    const wellness = new PatientWellnessRating()
    wellness.patientId = userId
    wellness.rating = rating
    wellness.overallRating = overallRating

    await wellness.save()

    console.log(rating)

    return response.status(200).json({ message: 'Wellness saved' })
  }

  public async show({ request, response }: HttpContextContract) {
    // only get name and id of patient
    try {
      const patient = await Patient.query()
        .select('user_id', 'name', 'date_of_birth')
        .where('user_id', request.param('id'))
        .first()

      return response.status(200).json(patient)
    } catch (error) {
      return response.status(400).json({ message: 'Patient not found' })
    }
  }

  public async activity({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const userId = session.get('userid')

    //get patient activity from PatientActivity
    const patientActivity = await PatientActivity.query()
      .select('steps', 'distance', 'calories', 'date')
      .where('patient_id', userId)
      .orderBy('date', 'asc')

    //create new object, replace "date" with "createdAt"
    const formattedPatientActivity = patientActivity.map((activity) => {
      return {
        steps: activity.steps,
        distance: activity.distance,
        calories: activity.calories,
        createdAt: activity.date,
      }
    })

    return response.status(200).json(formattedPatientActivity)
  }

  public async getLatestData({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    //get last data from patients_activity
    const userId = session.get('userid')
    const patientActivity = await PatientActivity.query()
      .select('steps', 'distance', 'calories', 'date')
      .where('patient_id', userId)
      .orderBy('date', 'desc')
      .first()

    const latestActivity = {
      steps: patientActivity?.steps,
      distance: patientActivity?.distance,
      calories: patientActivity?.calories,
      createdAt: patientActivity?.date,
    }

    const bloodPressureResponse = await PatientsBloodPressure.query()
      .where('patient_id', userId)
      .orderBy('created_at', 'desc')
      .first()

    const latestBloodPressure = {
      systolic: bloodPressureResponse?.systolic,
      diastolic: bloodPressureResponse?.diastolic,
      created_at: bloodPressureResponse?.createdAt,
    }

    const bloodOxygenResponse = await PatientsBloodOxygen.query()
      .where('patient_id', userId)
      .orderBy('created_at', 'desc')
      .first()

    const latestBloodOxygen = {
      bloodOxygen: bloodOxygenResponse?.bloodOxygen,
      createdAt: bloodOxygenResponse?.createdAt,
    }

    //get latest weight but only date and value

    const latestWeight = await PatientMeasurement.query()
      .select('value', 'date')
      .where('patient_id', userId)
      .where('type', MeasurementType.Weight)
      .orderBy('date', 'desc')
      .first()

    const latestHeight = await PatientMeasurement.query()
      .select('value')
      .where('patient_id', userId)
      .where('type', MeasurementType.Height)
      .orderBy('date', 'desc')
      .first()

    //calculate BMI
    let bmi = 0
    if (latestWeight && latestHeight) {
      bmi = parseFloat((latestWeight.value / latestHeight.value ** 2).toFixed(2))
    }

    const latestFatRatio = await PatientMeasurement.query()
      .select('value', 'date')
      .where('patient_id', userId)
      .where('type', MeasurementType.FatRatio)
      .orderBy('date', 'desc')
      .first()

    //get latest sleep summary

    const latestSleepSummary = await PatientSleepSummary.query()
      .select(
        'startdate',
        'enddate',
        'sleep_score',
        'total_sleep_time',
        'sleep_efficiency',
        'hr_average'
      )
      .where('patient_id', userId)
      .orderBy('startdate', 'desc')
      .first()

    //get date when the user last logged wellness
    const latestWellness = await PatientWellnessRating.query()
      .select('created_at')
      .where('patient_id', userId)
      .orderBy('created_at', 'desc')
      .first()

    return response.status(200).json({
      body: {
        latestActivity,
        latestBloodPressure,
        latestBloodOxygen,
        latestWeight,
        latestFatRatio,
        bmi,
        latestSleepSummary,
        latestWellness,
      },
    })
  }
}
