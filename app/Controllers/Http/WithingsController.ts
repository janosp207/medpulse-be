import Env from '@ioc:Adonis/Core/Env'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import axios from 'axios'

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
      console.log(apiResponse.data)

      const customUrlScheme = 'bpios://oauth'
      response.redirect(customUrlScheme)
    } catch (error) {
      console.error(error)
      response.status(500).send('Error fetching data from Withings API')
    }
  }

  public async getMeasures({ request, response }: HttpContextContract) {
    const token = request.input('token')
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
      return apiResponse.data
    } catch (error) {
      response.status(500).send('Error fetching data from Withings API')
    }
  }
}

module.exports = WithingsController
