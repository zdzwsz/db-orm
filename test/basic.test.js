var KnexManager = require("./../db/KnexManager");
var BasicService = require("./../db/BasicService")
var app = require('../index');
var should = require('should');
var TableMeta = require("./../db/TableMeta")

var table_meta = {
    "tableName":"_test_sys_users_",
    "primary":"id",
    "fields":[
        { "name": "id", "type": "int" }, 
        { "name": "name", "type": "string" ,"length" : 12,"notNullable":true}, 
        { "name": "age", "type": "int" ,"default": 10}
    ]
}


describe("基础数据服务测试 basicService", function () {

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
            KnexManager.destroy();
            app.close();
            done();
        });
       
    })

    it('增加数据 basicService.add', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta.tableName,table_meta.primary)
        basicService.add({id:1,name:'zdz',age:12},function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('查询数据 basicService.get', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta.tableName,table_meta.primary)
        basicService.get(1,function (e,data) {
            should.not.exist(e);
            data.should.have.property('name','zdz');
            done(e);
        })
    })

    it('更新数据 basicService.update', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta.tableName,table_meta.primary)
        basicService.update({id:1,name:'wsz',age:24},function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('执行sql测试 basicService.execSql', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta.tableName,table_meta.primary)
        basicService.execSql(["update "+ table_meta.tableName+" set name =? where id =?"],[["321",1]],function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('删除数据 basicService.delete', function (done) {
        this.timeout(3000);
        var basicService = new BasicService(table_meta.tableName,table_meta.primary)
        basicService.delete(1,function (e) {
            should.not.exist(e);
            done(e);
        })
    })

})