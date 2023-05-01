import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patient_sleep_summaries'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('patient_id')
        .unsigned()
        .references('user_id')
        .inTable('patients')
        .onDelete('CASCADE')
      table.integer('startdate').notNullable()
      table.integer('enddate').notNullable()
      table.float('sleep_efficiency').notNullable()
      table.float('sleep_latency').notNullable()
      table.float('total_sleep_time').notNullable()
      table.float('sleep_score').notNullable()
      table.float('hr_average').notNullable()
      table.float('hr_min').notNullable()
      table.float('hr_max').notNullable()

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
