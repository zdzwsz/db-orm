
var should = require('should');
var KnexManager = require("./../db/KnexManager");
var webServer = require('../index');
var supertest = require('supertest');
var request = supertest(webServer.server);

var test_data_type = '_test_servive_type__';
var test_entry_name = '_test_datatype__'
var test_entry_data = {
    "tableName": "test_datatype_table_", "primary": "id",
    "fields": [
        { "name": "id", "type": "increment" },
        { "name": "name", "type": "string", "length": 12, "notNullable": true },
        { "name": "birthday", "type": "dateTime" },
        { "name": "detail", "type": "string", "length": 255 },
        { "name": "price", "type": "float", "length": [8, 2] }
    ]
}


describe('datatype.test - 各种数据类型保存查询测试', function () {
    var token = null;
    before(function (done) {
        this.timeout(4000);
        request.post('/auth')
            .send({ name: 'admin', password: '123456' })
            .then(function (res) {
                token = res.body.token;
                request.post('/meta/' + test_data_type + '/add')
                    .set('x-access-token', token).then(
                        request.post('/meta/' + test_data_type + '/' + test_entry_name + '/add')
                            .set('x-access-token', token)
                            .send(test_entry_data)
                            .then(function(){
                                done();
                            })
                    )
            })
    });

   after(function (done) {
        request.post('/meta/' + test_data_type + '/' + test_entry_name + '/delete')
            .set('x-access-token', token)
            .then(function (err, res) {
                request.post('/meta/' + test_data_type + '/delete')
                    .set('x-access-token', token)
                    .then(function () {
                        console.log("测试完成,关闭API服务器");
                       KnexManager.destroy();
                       webServer.stop();
                       done();
                    })
            })

    });


    it('增加各种数据类型的实体', function (done) {
        var test_add = { name: "dog", birthday: "2018-02-12", detail: "this is a test", price: "12.89" };
        this.timeout(2000);
        request.post('/data/' + test_data_type + '/' + test_entry_name + '/add')
            .set('x-access-token', token)
            .send(test_add)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                done(err);
            });
    });

    it('保持数据返回主键值', function (done) {
        var test_add = { name: "dog", birthday: "2018-05-14", detail: "this is a test", price: "12.89" };
        this.timeout(2000);
        request.post('/data/' + test_data_type + '/' + test_entry_name + '/add')
            .set('x-access-token', token)
            .send(test_add)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                console.log(res.body)
                res.body.should.have.property('data', 2);
                setTimeout(done,100);
            });
    });

    it('读取各种数据类型', function (done) {
        var test_add = {id:1};
        this.timeout(2000);
        request.post('/data/' + test_data_type + '/' + test_entry_name + '/get')
            .set('x-access-token', token)
            .send(test_add)
            .expect('Content-Type', /json/)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.have.property('code', '000');
                res.body.data.should.have.property('name', 'dog');
                res.body.data.should.have.property('price', 12.89);
                console.log(res.body.data.birthday);
                done(err);
            });
    });

});