var KnexManager = require("./../db/KnexManager");
var TableMeta = require("./../db/TableMeta")
var webServer = require('../index');
var should = require('should');

var table_new = {
    "tableName":"test_sys_users",
    "primary":"id",
    "fields":[
        { "name": "id", "type": "int" }, 
        { "name": "name", "type": "string" ,"length" : 12,"notNullable":true}, 
        { "name": "age", "type": "int" ,"default": 10},
        { "name": "birthday","type":"dateTime"},
        { "name": "salary","type":"float","length":[10,2]},
        { "name": "crete_data","type":"timestamp"},
        { "name": "assets","type":"decimal","length":[8]},
        { "name": "type","type":"string","length":2,"default": "0"}
    ]
}

var table_update = {
    "r_primary":"name",
    "add":[
        { "name":"pic", "type":"string","length":255}
    ],
    "update":{
       "age":{"name": "ages", "type": "string"}
    },
    "delete":[
        "crete_data"
    ]
}

var r_primary = {
    "r_primary":"name"
}

var add_field = {
    "add":[
        { "name":"pic1", "type":"string","length":255},
        { "name":"pic2", "type":"string","length":255}
    ]
}

var update_field ={
    "update":{
        "age2":{"name": "ages1", "type": "string"}
     }
}

var delete_field ={
    "delete":[
        "crete_data","assets"
    ]
}

describe('元数据数据库操作 测试', function () {

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

    it('修改数据表(all)', function (done) {
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

    it('再次增加数据表', function (done) {
        this.timeout(4000);
        var table = TableMeta.load(table_new);
        table.create(function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('只是增加数据字段', function (done) {
        this.timeout(5000);
        var table = TableMeta.load(table_new);
        table.update(add_field, function (e) {
            should.not.exist(e);
            json = table.json;
            table_new = json;
            json.should.property('fields').with.lengthOf(10);
            done(e);
        })
    })

    it('只是删除数据字段', function (done) {
        this.timeout(5000);
        var table = TableMeta.load(table_new);
        table.update(delete_field, function (e) {
            should.not.exist(e);
            json = table.json;
            table_new = json;
            json.should.property('fields').with.lengthOf(8);
            done(e);
        })
    })

    it('只是更改主键字段', function (done) {
        this.timeout(5000);
        var table = TableMeta.load(table_new);
        table.update(r_primary, function (e) {
            should.not.exist(e);
            json = table.json;
            table_new = json;
            json.should.have.property('primary', 'name');
            done(e);
        })
    })


   it('只是修改原字段名称和类型', function (done) {
        this.timeout(5000);
        var table = TableMeta.load(table_new);
        table.update(update_field, function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('最后删除数据表', function (done) {
        this.timeout(5000);
        var table = TableMeta.load(table_new);
        table.delete(function (e) {
            should.not.exist(e);
            done(e);
        })
    })
})