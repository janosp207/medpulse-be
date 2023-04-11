import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patient_activities'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('patient_id')
        .unsigned()
        .references('user_id')
        .inTable('patients')
        .onDelete('CASCADE')
      table.integer('steps')
      table.float('distance')
      table.float('elevation')
      table.integer('soft')
      table.integer('moderate')
      table.integer('intense')
      table.integer('active')
      table.float('calories')
      table.float('totalcalories')
      table.timestamp('date', { useTz: true }).notNullable()
      /**
       * Uses timestamptz for PostgreSQL and DATETIME2 for MSSQL
       */
      table.timestamp('created_at', { useTz: true })
      table.timestamp('updated_at', { useTz: true })
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
