import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientsBloodOxygen from 'App/Models/PatientsBloodOxygen'

export default class PatientsBloodOxygensController {
  public async index({}: HttpContextContract) {
    return 'Hello World!'
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

    return response.status(200).json(bloodPressure)
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
