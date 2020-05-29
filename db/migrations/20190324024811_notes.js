exports.up = async function(knex, Promise) {
  await knex.schema.createTableIfNotExists('notes', table => {
    table.string('user_id', 20).notNullable().primary().index();
    table.text('note').notNullable().primary();
    table.string('created_by_id', 20).notNullable();
    table.string('created_by_name', 128).notNullable();
    table.dateTime('created_at').notNullable();
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.dropTableIfExists('notes');
};
