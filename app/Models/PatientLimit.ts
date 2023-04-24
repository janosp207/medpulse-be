import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class PatientLimit extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patientId: number

  @column()
  public weight: number

  @column()
  public weightMin: number

  @column()
  public fatRatio: number

  @column()
  public bmi: number

  @column()
  public diastolicMax: number

  @column()
  public diastolicMin: number

  @column()
  public systolicMax: number

  @column()
  public systolicMin: number

  @column()
  public bloodOxygenMax: number

  @column()
  public bloodOxygenMin: number

  @column()
  public sleepDurationMin: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
