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
  public fatRatio: number

  @column()
  public bmi: number

  @column()
  public diastolicBloodPressureMax: number

  @column()
  public diastolicBloodPressureMin: number

  @column()
  public systolicBloodPressureMax: number

  @column()
  public systolicBloodPressureMin: number

  @column()
  public bloodOxygenMax: number

  @column()
  public bloodOxygenMin: number

  @column()
  public sleepDurationMax: number

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
