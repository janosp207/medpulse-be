import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Doctor from 'App/Models/Doctor'

export default class DoctorsController {
  // login
  public async login({ request, response }: HttpContextContract) {
    const { name, password } = request.all()

    try {
      const doctor = await Doctor.query().where('name', name).firstOrFail()

      if (doctor.password !== password) {
        return response.status(401).json({ message: 'Invalid credentials' })
      } else {
        return response.status(200).json({ doctorId: doctor.id })
      }
    } catch (error) {
      //take the error message from the error object and return it
      return response.status(401).json({ message: error.message })
    }
  }
}
