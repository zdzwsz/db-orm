
var webServer = require('../index');
var should = require('should');
var TableMeta = require("../db/TableMeta")
var BasicService = require("../db/BasicService")
var table_meta = {
    "tableName":"_test_sys_users_",
    "primary":"id",
    "fields":[
        { "name": "id", "type": "int" }, 
        { "name": "name", "type": "string" ,"length" : 12,"notNullable":true}, 
        { "name": "age", "type": "int" ,"default": 10}
    ]
}


describe("basic.test - 基础数据服务测试 basicService", function () {

    before(function(done){
        this.timeout(4000);
        var table = TableMeta.load(table_meta);
        table.create(function(){
            done();
        });
    })

    after(function (done) {
        this.timeout(4000);
        var table = TableMeta.load(table_meta);
        table.delete(function(){
            console.log("close database pool!");
            var KnexManager = require("./../db/KnexManager");
            KnexManager.destroy();
            webServer.stop();
            done();
        });
       
    })

    it('增加数据 basicService.add', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.add({id:1,name:'zdz',age:12},function (e,data) {
            should.not.exist(e);
            setTimeout(() => {
                done(e);
            }, 100); 
            
        })
    })

    it('查询数据 basicService.get', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.get(1,function (e,data) {
            should.not.exist(e);
            console.log(data);
            data.should.have.property('name','zdz');
            done(e);
        })
    })

    it('更新数据 basicService.update', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.update({id:1,name:'wsz',age:24},function (e,data) {
            console.log(data);
            should.not.exist(e);
            done(e);
        })
    })

    it('执行sql测试 basicService.execSql', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.execSql(["update "+ table_meta.tableName+" set name =? where id =?"],[["321",1]],function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('删除数据 basicService.delete', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta)
        basicService.delete(1,function (e) {
            should.not.exist(e);
            done(e);
        })
    })

})