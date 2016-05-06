module.exports = {

  development: {
    client: 'postgresql',
    connection: {
      database: 'dakdak',
      user:     'dakdak',
      password: 'dakdak'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },


  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
