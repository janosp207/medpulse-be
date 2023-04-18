import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientSleepLog from 'App/Models/PatientSleepLog'
import PatientSleepState from 'App/Models/PatientSleepState'

export default class PatientsBloodOxygensController {
  public async index({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('patientId', request.param('id'))
    }

    const patientId = session.get('patientId')

    if (!patientId) {
      return response.status(404).send('Patient not found')
    }

    if (patientId) {
      //get all sleep logs for user
      const sleepLogs = await PatientSleepLog.query()
        .where('patient_id', patientId)
        .orderBy('startdate', 'desc')

      return response.status(200).json(sleepLogs)
    }
  }

  public async create({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async store({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async show({ session, request, response }: HttpContextContract) {
    let sleepLogId = request.param('sleepId')
    if (request.param('id')) {
      session.put('patientId', request.param('id'))
    }

    const patientId = session.get('patientId')

    if (!patientId) {
      return response.status(404).send('Patient not found')
    }

    if (patientId && sleepLogId) {
      const sleepStates = await PatientSleepState.query()
        .where('sleep_id', sleepLogId)
        .orderBy('startdate', 'desc')

      return response.status(200).json(sleepStates)
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
}
