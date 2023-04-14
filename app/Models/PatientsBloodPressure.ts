import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class PatientsBloodPressure extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patient_id: number

  @column()
  public systolic: number

  @column()
  public diastolic: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
