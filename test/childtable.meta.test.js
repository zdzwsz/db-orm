var KnexManager = require("./../db/KnexManager");
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
                    { "name": "detail", "type": "string" }
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
        { "name": "resume.position", "type": "string" }
    ],
    "update": {
        "resume.detail": { "name": "detail", "type": "string", "length": 255 }
    },
    "delete": [
        "resume.startTime", "resume.stopTime",
    ]
}

var data_add = {
    id: 1,
    name: "zdzwsz",
    age: 12,
    birthday: "2010-11-02 12:00:00",
    resume: [
        {
            id: 1,
            startTime: "1980-11-02",
            stopTime: "1996-11-02",
            detail: "study"
        },
        {
            id: 2,
            startTime: "1996-11-02",
            stopTime: "2006-11-02",
            detail: "work"
        }
    ]

}

describe.only('子从表元数据数据库操作 测试', function () {

    after(function () {
        console.log("close database pool!");
        KnexManager.destroy();
        webServer.stop();
    })

    it('增加数据表', function (done) {
        this.timeout(3000);
        var table = TableMeta.load(table_new);
        table.create(function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it.skip('修改数据表(all)', function (done) {
        this.timeout(8000);
        var table = TableMeta.load(table_new);
        table.update(table_update, function (e) {
            should.not.exist(e);
            json = table.json;
            json.should.have.property('primary', 'name');
            json.should.property('fields').with.lengthOf(8);
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