import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patients'

  public async up() {
    //update patients table
    this.schema.table(this.tableName, (table) => {
      table.string('name').nullable().after('user_id')
      table.timestamp('date_of_birth', { useTz: true }).nullable().after('name')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
