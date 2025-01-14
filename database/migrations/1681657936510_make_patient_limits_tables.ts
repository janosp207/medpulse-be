import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'patient_limits'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table
        .integer('patient_id')
        .unsigned()
        .references('user_id')
        .inTable('patients')
        .onDelete('CASCADE')
      table.float('weight').nullable()
      table.float('fat_ratio').nullable()
      table.float('bmi').nullable()
      table.integer('diastolic_max').nullable()
      table.integer('diastolic_min').nullable()
      table.integer('systolic_max').nullable()
      table.integer('systolic_min').nullable()
      table.float('blood_oxygen_max').nullable()
      table.float('blood_oxygen_min').nullable()
      table.float('sleep_duration_min').nullable()

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
