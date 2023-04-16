import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientMeasurement from 'App/Models/PatientMeasurement'

const MeasurementsDataTypes = {
  1: 'weightData',
  4: 'heightData',
  6: 'fatRatioData',
}

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

      //group the data by type but use MeasurementsDataTypes as keys to group by
      const groupedData = measurementData.reduce((acc, curr) => {
        const key = MeasurementsDataTypes[curr.type]
        if (!acc[key]) {
          acc[key] = []
        }
        acc[key].push(curr)
        return acc
      }, {})

      return response.status(200).json(groupedData)
    }
  }

  public async show({}: HttpContextContract) {
    return 'Hello World!'
  }
}
