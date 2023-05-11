import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Doctor from 'App/Models/Doctor'

export default class DoctorsController {
  // login
  public async login({ session, request, response }: HttpContextContract) {
    const { name, password } = request.all()

    try {
      const doctor = await Doctor.query().where('name', name).firstOrFail()

      if (doctor.password !== password) {
        return response.status(401).json({ message: 'Invalid credentials' })
      } else {
        //set docotrs id to session
        session.put('doctorId', doctor.id)
        return response.status(200).json({ message: 'Login successful' })
      }
    } catch (error) {
      return response.status(401).json({ message: 'Invalid credentials' })
    }
  }
}
