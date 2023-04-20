import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientsBloodPressure from 'App/Models/PatientsBloodPressure'

export default class PatientsBloodPressuresController {
  public async index({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const patientId = session.get('userid')

    if (!patientId) {
      return response.status(404).send('Patient not found')
    }

    if (patientId) {
      //get all sleep logs for user
      const bloodPressures = await PatientsBloodPressure.query()
        .where('patient_id', patientId)
        .orderBy('created_at', 'asc')

      return response.status(200).json(bloodPressures)
    }
  }

  public async create({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async store({ session, request, response }: HttpContextContract) {
    const { systolic, diastolic } = request.all()
    const patientId = session.get('userid')
    const bloodPressure = await PatientsBloodPressure.create({
      patient_id: patientId,
      systolic,
      diastolic,
    })

    const responseData = {
      systolic: bloodPressure.systolic,
      diastolic: bloodPressure.diastolic,
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
