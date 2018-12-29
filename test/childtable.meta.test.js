
var TableMeta = require("./../db/TableMeta")
var webServer = require('../index');
var should = require('should');

var table_new = {
    "tableName": "test_child_table_users",
    "primary": "id",
    "fields": [
        { "name": "id", "type": "int" },
        { "name": "name", "type": "string", "length": 12, "notNullable": true },
        { "name": "age", "type": "int", "default": 10 },
        { "name": "birthday", "type": "dateTime" },
        {
            "name": "resume", "type": "table", "relation": {
                "tableName": "test_resume",
                "primary": "id",
                "fields": [
                    { "name": "id", "type": "int" },
                    { "name": "startTime", "type": "dateTime" },
                    { "name": "stopTime", "type": "dateTime" },
                    { "name": "detail", "type": "string" },
                    { "name": "old", "type": "int" }
                ]
            }
        },
        {
            "name": "family", "type": "table", "relation": {
                "tableName": "test_family",
                "primary": "id",
                "fields": [
                    { "name": "id", "type": "int" },
                    { "name": "name", "type": "string" },
                    { "name": "detail", "type": "string" }
                ]
            }
        }
    ]
}

var table_update = {
    "add": [
        { "name": "resume.position", "type": "string" },
        { "name": "position", "type": "string" },
        {
            "name": "company", "type": "table", "relation": {
                "tableName": "test_company",
                "primary": "id",
                "fields": [
                    { "name": "id", "type": "int" },
                    { "name": "name", "type": "string" }
                ]
            }
        }
    ],
    "update": {
        "resume.detail": { "name": "detail", "type": "string", "length": 255 }
    },
    "delete": [
        "family","resume.old"
    ]
}

describe('childtable.meta.test -  子从表元数据数据库操作 测试', function () {

    after(function () {
        console.log("close database pool!");
        var KnexManager = require("./../db/KnexManager");
        KnexManager.destroy();
        webServer.stop();
    })

    it('增加数据表', function (done) {
        let table_string = JSON.parse(JSON.stringify(table_new))
        this.timeout(5000);
        var table = TableMeta.load(table_string);
        table.create(function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('修改数据表(all)', function (done) {
        this.timeout(8000);
        let table_string = JSON.parse(JSON.stringify(table_new))
        var table = TableMeta.load(table_string);
        table.update(table_update, function (e) {
            should.not.exist(e);
            json = table.json;
            table_new = json;
            console.log(json);
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