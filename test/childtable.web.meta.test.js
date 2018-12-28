var KnexManager = require("../db/KnexManager");
var webServer = require('../index');
var should = require('should');
var supertest = require('supertest');
var request = supertest(webServer.server);

var test_entry_data = {
    "tableName": "test_childtable_",
    "primary": "id",
    "fields": [
        { "name": "id", "type": "int" },
        { "name": "name", "type": "string", "length": 12, "notNullable": true },
        { "name": "age", "type": "int", "default": 10 },
        { "name": "birthday", "type": "dateTime" },
        {
            "name": "resume", "type": "table", "relation": {
                "tableName": "test_resume1999",
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
                "tableName": "test_family1999",
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

var test_entry_update_data = {
    "add": [
        { "name": "resume.position", "type": "string" },
        { "name": "position", "type": "string" },
        {
            "name": "company", "type": "table", "relation": {
                "tableName": "test_company1999",
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

let test_data_type = "_test_childTable"
let test_entry_name = "_childTable_";

describe('childtable.web.meta.test -  子从表元数据数据库服务操作 测试', function () {

    var token = null;
    before(function () {
        return request.post('/metaAuth')
            .send({ name: 'admin', password: '123456' })
            .then(function (res) {
                token = res.body.token;
                request.post('/meta/' + test_data_type + '/add')
                    .set('x-access-token', token).then()
            })
    });

    after(function (done) {
        request.post('/meta/' + test_data_type + '/delete')
            .set('x-access-token', token)
            .then(function () {
                console.log("测试完成,关闭API服务器");
                KnexManager.destroy();
                webServer.stop();
                done();
            })
    });

    it('增加数据表web服务', function (done) {
        this.timeout(8000);
        request.post('/meta/' + test_data_type + '/' + test_entry_name + '/add')
            .set('x-access-token', token)
            .send(test_entry_data)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                done(err);
            });
    })

    it('修改数据表(all)web服务', function (done) {
        this.timeout(8000);
        request.post('/meta/' + test_data_type + '/' + test_entry_name + '/update')
            .set('x-access-token', token)
            .send(test_entry_update_data)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                done(err);
            });
    })


    it('删除数据表web服务', function (done) {
        this.timeout(4000);
        request.post('/meta/' + test_data_type + '/' + test_entry_name + '/delete')
            .set('x-access-token', token)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                done(err);
            });
    })

})