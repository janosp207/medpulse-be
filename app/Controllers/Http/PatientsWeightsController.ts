import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientMeasurement from 'App/Models/PatientMeasurement'
import { MeasurementType } from 'App/enums'

export default class PatientsWeightsController {
  public async index({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const patientId = session.get('userid')

    if (patientId) {
      const weightData = await PatientMeasurement.query()
        .select('value', 'date')
        .where('patient_id', patientId)
        .where('type', MeasurementType.Weight)
        .orderBy('date', 'asc')

      return response.status(200).json(weightData)
    }
  }

  public async show({}: HttpContextContract) {
    return 'Hello World!'
  }
}
