
var should = require('should');
var knex = require("./../db/KnexManager").getKnex();
var app = require('../index');
var supertest = require('supertest');
var request = supertest(app);

var test_data_type = '_test_servive__';
var test_entry_name = '_test_entry__'
var test_entry_data = {
    "tableName": "test_pet_table_", "primary": "id",
    "fields": [
        { "name": "id", "type": "int" },
        { "name": "name", "type": "string", "length": 12, "notNullable": true },
        { "name": "birthday", "type": "dateTime" },
        { "name": "detail", "type": "string", "length": 255 },
        { "name": "pic", "type": "string", "length": 255 },
        { "name": "price", "type": "float", "length": [8, 2] }
    ]
}
var test_entry_update_data = {
    "r_primary": "name",
    "add": [
        { "name": "old", "type": "int" }
    ],
    "update": {
        "price": { "name": "other_price", "type": "string" }
    },
    "delete": [
        "birthday"
    ]
}

describe('元数据服务 测试', function () {
    var token = null;
    before(function () {
        return request.post('/auth')
            .send({ name: 'admin', password: '123456' })
            .then(function (res) {
                token = res.body.token;
                request.post('/meta/' + test_data_type + '/add')
                    .set('x-access-token', token).then()
            })
    });

    after(function () {
        request.post('/meta/' + test_data_type + '/delete')
            .set('x-access-token', token)
            .then(function () {
                console.log("测试完成,关闭API服务器");
                knex.destroy();
                app.close();
            })
    });

    it('增加元数据服务', function (done) {
        request.post('/meta/' + test_data_type + '/' + test_entry_name + '/add')
            .set('x-access-token', token)
            .send(test_entry_data)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                done(err);
            });
    });

    it('查询元数据服务', function (done) {
        request.post('/meta/' + test_data_type + '/' + test_entry_name + '/get')
            .set('x-access-token', token)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                done(err);
            });
    });

    it('更新元数据服务', function (done) {
        request.post('/meta/' + test_data_type + '/' + test_entry_name + '/update')
            .set('x-access-token', token)
            .send(test_entry_update_data)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                done(err);
            });
    });


    it('删除元数据服务', function (done) {
        request.post('/meta/' + test_data_type + '/' + test_entry_name + '/delete')
            .set('x-access-token', token)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                done(err);
            });
    });

});