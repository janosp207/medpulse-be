import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientMeasurement from 'App/Models/PatientMeasurement'

export default class PatientsMeasurementsController {
  public async index({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const type = request.param('type').split(',')
    const patientId = session.get('userid')

    if (patientId) {
      //handle request with mulitple types separated by a comma

      const measurementData = await PatientMeasurement.query()
        .select('value', 'date', 'type')
        .where('patient_id', patientId)
        .whereIn('type', type)
        .orderBy('date', 'asc')

      return response.status(200).json(measurementData)
    }
  }

  public async show({}: HttpContextContract) {
    return 'Hello World!'
  }
}
