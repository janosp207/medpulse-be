import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patient_limits'

  public async up() {
    this.schema.table(this.tableName, (table) => {
      table.float('weight_min').nullable().after('weight')
    })
  }

  public async down() {
    this.schema.table(this.tableName, (table) => {
      table.dropColumn('weight_min')
    })
  }
}
