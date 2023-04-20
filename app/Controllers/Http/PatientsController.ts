import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Patient from 'App/Models/Patient'
import PatientActivity from 'App/Models/PatientActivity'
import PatientMeasurement from 'App/Models/PatientMeasurement'
import PatientSleepSummary from 'App/Models/PatientSleepSummary'
import PatientsBloodOxygen from 'App/Models/PatientsBloodOxygen'
import PatientsBloodPressure from 'App/Models/PatientsBloodPressure'
import { MeasurementType } from 'App/enums'

export default class PatientsController {
  public async index({ response }: HttpContextContract) {
    //return id and name of all patients
    const patients = await Patient.query().select('user_id', 'name', 'date_of_birth')

    return response.status(200).json(patients)
  }

  public async create({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async store({}: HttpContextContract) {
    return 'Hello World!'
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

  public async edit({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async update({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async destroy({}: HttpContextContract) {
    return 'Hello World!'
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

    return response.status(200).json({
      body: {
        latestActivity,
        latestBloodPressure,
        latestBloodOxygen,
        latestWeight,
        latestFatRatio,
        bmi,
        latestSleepSummary,
      },
    })
  }
}
