
var webServer = require('../index');
var should = require('should');
var TableMeta = require("../db/TableMeta")
var BasicService = require("../db/BasicService")
var table_meta = {
    "tableName": "test_child_table_1998",
    "primary": "id",
    "fields": [
        { "name": "id", "type": "increment" },
        { "name": "name", "type": "string", "length": 12, "notNullable": true },
        { "name": "age", "type": "int", "default": 10 },
        { "name": "birthday", "type": "dateTime" },
        {
            "name": "resume", "type": "table", "relation": {
                "tableName": "test_resume_1998",
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
                "tableName": "test_family_1998",
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

describe("childTable.basic.test - 基础数据服务测试(子从表) basicService", function () {

    before(function (done) {
        this.timeout(4000);
        var table = TableMeta.load(table_meta);
        table.create(function () {
            done();
        });
    })

    after(function (done) {
        this.timeout(4000);
        var table = TableMeta.load(table_meta);
        table.delete(function(){
            console.log("close database pool!");
            var KnexManager = require("../db/KnexManager");
            KnexManager.destroy();
            webServer.stop();
            done();
        });
    })

    it('增加数据子从表 basicService.add', function (done) {
        var data_add = {
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
                    stopTime: "2006-12-02",
                    detail: "work"
                }
            ],
            family: [
                {
                    id: 1,
                    name: "zdz",
                    detail: "father"
                },
                {
                    id: 2,
                    name: "wsz",
                    detail: "mather"
                }
            ]

        }
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.add(data_add, function (e, data) {
            should.not.exist(e);
            console.log("返回主键值:" + data)
            setTimeout(() => {
                done(e);
            }, 60);
        })
    })

    it('查询数据子从表 basicService.get', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.get(1, function (e, data) {
            console.log(data);
            should.not.exist(e);
            done(e);
        })
    })

    it('更新数据子从表 basicService.update', function (done) {
        var data_update = {
            id: 1,
            name: "zdzwsz111",
            age: 12,
            birthday: "2010-11-02 12:00:00",
            resume: [
                {
                    id: 1,
                    startTime: "1980-11-02",
                    stopTime: "1996-12-02",
                    detail: "study111"
                }
            ],
            family: [
                {
                    id: 1,
                    name: "zdz1",
                    detail: "father"
                },
                {
                    id: 3,
                    name: "wsz1",
                    detail: "mather1"
                }
            ]

        }
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.update(data_update, function (e,data) {
            console.log(data);
            should.not.exist(e);
            done(e);
        })
    })

    it('删除数据子从表 basicService.delete', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.delete(1, function (e, data) {
            console.log(data);
            should.not.exist(e);
            done(e);
        })
    })

})