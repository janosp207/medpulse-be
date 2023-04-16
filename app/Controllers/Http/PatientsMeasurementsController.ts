import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientMeasurement from 'App/Models/PatientMeasurement'

export default class PatientsMeasurementsController {
  public async index({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const type = request.param('type')
    const patientId = session.get('userid')

    if (patientId) {
      const weightData = await PatientMeasurement.query()
        .select('value', 'date')
        .where('patient_id', patientId)
        .where('type', type)
        .orderBy('date', 'asc')

      return response.status(200).json(weightData)
    }
  }

  public async show({}: HttpContextContract) {
    return 'Hello World!'
  }
}
