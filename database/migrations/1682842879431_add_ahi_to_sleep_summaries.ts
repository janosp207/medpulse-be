import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patient_sleep_summaries'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.integer('ahi')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
