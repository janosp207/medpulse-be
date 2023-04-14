import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class PatientsBloodOxygen extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patient_id: number

  @column()
  public bloodOxygen: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
