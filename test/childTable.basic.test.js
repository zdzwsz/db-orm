var KnexManager = require("../db/KnexManager");
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

describe.only("childTable.basic.test - 基础数据服务测试(子从表) basicService", function () {

    before(function(done){
        this.timeout(4000);
        var table = TableMeta.load(table_meta);
        table.create(function(){
            done();
        });
    })

    // after(function (done) {
    //     this.timeout(4000);
    //     var table = TableMeta.load(table_meta);
    //     table.delete(function(){
    //         console.log("close database pool!");
    //         KnexManager.destroy();
    //         webServer.stop();
    //         done();
    //     });
       
    // })

    it('增加数据 basicService.add', function (done) {
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
                    stopTime: "2006-11-02",
                    detail: "work"
                }
            ],
            family:[
                {
                    id:1,
                    name:"zdz",
                    detail:"father"
                },
                {
                    id:2,
                    name:"wsz",
                    detail:"mather"
                }
            ]
        
        }
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.add(data_add,function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it.skip('查询数据 basicService.get', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.get(1,function (e,data) {
            should.not.exist(e);
            done(e);
        })
    })

    it.skip('更新数据 basicService.update', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.update({id:1,name:'wsz',age:24},function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it.skip('删除数据 basicService.delete', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.delete(1,function (e) {
            should.not.exist(e);
            done(e);
        })
    })

})