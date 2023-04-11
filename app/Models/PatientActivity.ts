import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class PatientActivity extends BaseModel {
  @column({ isPrimary: true })
  public id: number

  @column()
  public patient_id: number

  @column()
  public steps: number

  @column()
  public distance: number

  @column()
  public elevation: number

  @column()
  public soft: number

  @column()
  public moderate: number

  @column()
  public intense: number

  @column()
  public active: number

  @column()
  public calories: number

  @column()
  public totalcalories: number

  @column()
  public date: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
