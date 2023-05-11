import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patients'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.integer('doctor_id').unsigned().references('doctors.id').onDelete('CASCADE')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('doctor_id')
    })
  }
}
