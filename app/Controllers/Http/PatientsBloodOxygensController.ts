import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientsBloodOxygen from 'App/Models/PatientsBloodOxygen'

export default class PatientsBloodOxygensController {
  public async index({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const patientId = session.get('userid')
    const bloodOxygen = await PatientsBloodOxygen.query()
      .where('patient_id', patientId)
      .orderBy('created_at', 'asc')

    return response.status(200).json(bloodOxygen)
  }

  public async create({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async store({ session, request, response }: HttpContextContract) {
    // store blood oxygen
    const { bloodOxygen } = request.all()
    const patientId = session.get('userid')
    const bloodPressure = await PatientsBloodOxygen.create({
      patient_id: patientId,
      bloodOxygen,
    })

    const responseData = {
      bloodOxygen: bloodPressure.bloodOxygen,
      createdAt: bloodPressure.createdAt,
    }

    return response.status(200).json({ body: responseData })
  }

  public async show({}: HttpContextContract) {
    return 'Hello World!'
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
}
