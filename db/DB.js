const knex = require("./KnexManager").getKnex();
class DB {
    constructor() {
        this.sqlRunners = [];
    }

    select(tableName, where, paramter) {
        if(typeof(where) =="undefined"){
            this.sqlRunners.push(knex(tableName));
        }else{
            this.sqlRunners.push(knex(tableName).whereRaw(where, paramter));
        }
        return this;
    }

    then(callback) {
        for (let i = 0; i < this.sqlRunners.length; i++) {
            let runner = this.sqlRunners[i];
            runner.then(callback);
        }
    }
}
module.exports = DB;