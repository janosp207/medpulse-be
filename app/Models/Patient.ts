import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { DateTime } from 'luxon'

export default class Patient extends BaseModel {
  @column({ isPrimary: true })
  public user_id: number

  @column()
  public name: string

  @column()
  public date_of_birth: DateTime

  @column()
  public refresh_token: string

  @column()
  public access_token: string

  @column()
  public expires_at: DateTime

  @column.dateTime({ autoCreate: true })
  public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  public updatedAt: DateTime
}
