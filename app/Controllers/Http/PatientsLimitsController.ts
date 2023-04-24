import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientLimit from 'App/Models/PatientLimit'

export default class PatientsBloodPressuresController {
  public async index({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const patientId = session.get('userid')

    if (patientId) {
      const limitValues = await PatientLimit.findBy('patient_id', patientId)

      const responseData = {
        weight: limitValues?.weight,
        weightMin: limitValues?.weightMin,
        fatRatio: limitValues?.fatRatio,
        bmi: limitValues?.bmi,
        diastolicMax: limitValues?.diastolicMax,
        diastolicMin: limitValues?.diastolicMin,
        systolicMax: limitValues?.systolicMax,
        systolicMin: limitValues?.systolicMin,
        bloodOxygenMax: limitValues?.bloodOxygenMax,
        bloodOxygenMin: limitValues?.bloodOxygenMin,
        sleepDurationMin: limitValues?.sleepDurationMin,
      }

      if (limitValues) {
        return response.status(200).json(responseData)
      }
    }

    return response.status(200).json({})
  }

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
}
