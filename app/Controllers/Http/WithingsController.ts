import Env from '@ioc:Adonis/Core/Env'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Patient from 'App/Models/Patient'
import axios from 'axios'
import { DateTime } from 'luxon'

export default class WithingsController {
  public async callback({ request, response }: HttpContextContract) {
    const code = request.input('code')
    const url = 'https://wbsapi.withings.net/v2/oauth2'
    try {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
      const data = {
        action: 'requesttoken',
        client_id: Env.get('CLIENT_ID'),
        client_secret: Env.get('SECRET'),
        code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3333/callback',
      }

      const apiResponse = await axios.post(url, data, { headers })

      const {
        userid,
        refresh_token: refreshToken,
        access_token: accessToken,
        expires_in: expiresIn,
      } = apiResponse.data.body

      const expiresAt = DateTime.now().plus({ seconds: expiresIn })

      //check if user exists in database
      const patient = await Patient.findBy('user_id', userid)

      if (patient) {
        //update patient
        patient.refresh_token = refreshToken
        patient.access_token = accessToken
        patient.expires_at = expiresAt
        await patient.save()
      } else {
        //create patient
        await Patient.create({
          user_id: userid,
          refresh_token: refreshToken,
          access_token: accessToken,
          expires_at: expiresAt,
        })
      }

      return userid
    } catch (error) {
      console.error(error)
      response.status(500).send('Error fetching data from Withings API')
    }
  }

  public async storeAccessTokenByUserId({ session, request, response }: HttpContextContract) {
    const userId = request.input('userId')
    const patient = await Patient.findBy('user_id', userId)

    if (patient) {
      const { access_token: accessToken, expires_at: expiresAt } = patient
      session.put('accessToken', accessToken)
      session.put('expiresAt', expiresAt)

      return response.json({ body: { accessToken } })
    } else {
      response.status(404).send('Patient not found')
    }
  }

  public async getMeasurements({ session, response }: HttpContextContract) {
    const token = session.get('accessToken')
    const url = 'https://scalews.withings.com/measure'
    try {
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
      }
      const data = {
        action: 'getmeas',
      }
      const apiResponse = await axios.post(url, data, { headers })
      return apiResponse.data.body
    } catch (error) {
      response.status(500).send('Error fetching data from Withings API')
    }
  }
}

module.exports = WithingsController
