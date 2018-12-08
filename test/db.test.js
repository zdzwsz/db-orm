var knex = require("./../db/KnexManager").getKnex();
var table_update = require("./test_data_update.json")
var table_new = require("./test_data_newTable.json")
var TableMeta = require("./../db/TableMeta")
var app = require('../index');

describe.skip('元数据数据库操作 测试', function () {

    after(function () {
        console.log("close database pool!");
        knex.destroy();
        app.close();
    })

    it('增加数据表', function (done) {
        var table = TableMeta.load(table_new);
        table.create(function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('修改数据表', function (done) {
        var table = TableMeta.load(table_new);
        table.update(table_update, function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('删除数据表', function (done) {
        var table = TableMeta.load(table_new);
        table.delete(function (e) {
            should.not.exist(e);
            done(e);
        })
    })
})