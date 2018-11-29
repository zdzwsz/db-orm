
var knex = require('knex')(
    {
        client: 'pg', //指明数据库类型，还可以是mysql，sqlite3等等 
        connection: { //指明连接参数 
            host: '127.0.0.1',
            user: 'postgres',
            password: '123',
            database: 'test'
        }
    });
/**
knex.schema.createTable('users', function (table) {
    table.increments("id").primary();
    table.string('name').notNullable();
    table.integer('age');
    table.timestamps();
}).catch(function (e) {
    console.error('创建表：users error.'+e);
});
 */

function addUser() {
    return knex('users').insert({
        name: 'zdzwsz', age:18
    }).then(() => {
        return knex('users').select().where('age', 18)
    }).then(users => {
        return users
    }).catch(err => {
        throw err
    })
}

addUser().then((users) => {console.log('from users:', users)})



