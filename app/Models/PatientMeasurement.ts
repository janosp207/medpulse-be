import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class PatientMeasurement extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patient_id: number

  @column()
  public type: number

  @column()
  public value: number

  @column()
  public date: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
