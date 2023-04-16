import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientLimit from 'App/Models/PatientLimit'

export default class PatientsBloodPressuresController {
  public async store({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const updateData = request.all()
    const patientId = session.get('userid')

    if (patientId) {
      const patientLimit = await PatientLimit.findBy('patientId', patientId)

      if (patientLimit) {
        patientLimit.merge(updateData)
        await patientLimit.save()
      } else {
        await PatientLimit.create({
          patientId,
          ...updateData,
        })
      }
    }

    return response.status(200).json({ message: 'Patient limit updated' })
  }

  public async show({}: HttpContextContract) {
    return 'Hello World!'
  }
}
