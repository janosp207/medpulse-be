import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import PatientSleepLog from 'App/Models/PatientSleepLog'
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
        .orderBy('startdate', 'asc')

      return response.status(200).json(sleepLogs)
    }
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
      const sleepStates = await Database.rawQuery(
        `
  SELECT
    patient_sleep_states.*,
    (
      SELECT COALESCE(json_agg(json_build_object('hr', hr, 'timestamp', timestamp)), '[]'::json)
      FROM patient_sleep_heart_rates 
      WHERE sleep_state_id = patient_sleep_states.id
    ) AS heart_rates
  FROM patient_sleep_states
  WHERE sleep_id = ?
  ORDER BY startdate ASC;
`,
        [sleepLogId]
      )

      return response.status(200).json(sleepStates.rows)
    }
  }
}
