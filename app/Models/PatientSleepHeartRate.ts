import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class PatientSleepHeartRate extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patientId: number

  @column()
  public sleepStateId: number

  @column()
  public timestamp: number

  @column()
  public hr: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
