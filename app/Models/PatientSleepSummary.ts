import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class PatientSleepSummary extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patientId: number

  @column()
  public startdate: number

  @column()
  public enddate: number

  @column()
  public sleepEfficiency: number

  @column()
  public sleepLatency: number

  @column()
  public totalSleepTime: number

  @column()
  public sleepScore: number

  @column()
  public hrAverage: number

  @column()
  public hrMin: number

  @column()
  public hrMax: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
