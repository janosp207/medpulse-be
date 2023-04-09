import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export default class PatientsController {
  public async index({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async create({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async store({}: HttpContextContract) {
    return 'Hello World!'
  }

  public async show({}: HttpContextContract) {
    return 'Hello World!'
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
