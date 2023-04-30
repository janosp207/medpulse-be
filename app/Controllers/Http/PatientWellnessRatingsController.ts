import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import PatientWellnessRating from 'App/Models/PatientWellnessRating'

export default class PatientWellnessRatingsController {
  public async index({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    const patientId = session.get('userid')

    if (patientId) {
      const wellnessRatings = await PatientWellnessRating.query()
        .where('patient_id', patientId)
        .orderBy('created_at', 'asc')

      return response.status(200).json(wellnessRatings)
    }
  }

  public async store({ session, request, response }: HttpContextContract) {
    if (request.param('id')) {
      session.put('userid', request.param('id'))
    }

    //just log the 1 to 5 values from request to database
    const userId = session.get('userid')

    //get "rating" and "overall_rating" from request
    const { rating, overallRating } = request.all()

    //create new wellness entry
    const wellness = new PatientWellnessRating()
    wellness.patientId = userId
    wellness.rating = rating
    wellness.overallRating = overallRating

    await wellness.save()

    console.log(rating)

    return response.status(200).json({ message: 'Wellness saved' })
  }
}
