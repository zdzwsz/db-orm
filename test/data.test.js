var should = require('should');
var app = require('../index');
var supertest = require('supertest');
var request = supertest(app);
var KnexManager = require("./../db/KnexManager");
var test_add = { p0: { id: 1, name: "dog", age: "2" } };
var test_delete = { p0: 1 };
var test_get = { p0: 1 };
var test_update = { p0: { id: 1, name: "egg", age: "21" } };

describe('数据服务增删查改 测试', function () {
  var token = null;

  before(function () {
    return request.post('/auth')
      .send({ name: 'admin', password: '123456' })
      .then(function (res) {
        token = res.body.token;
      });
  });

  after(function (done) {
    console.log("测试完成,关闭API服务器");
    app.close();
    KnexManager.destroy();
    done();
  });

  it('增加一条数据记录', function (done) {
    request.post('/data/petshop/pet/add')
      .set('x-access-token', token)
      .send(test_add)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('查询一条数据记录', function (done) {
    request.post('/data/petshop/pet/get')
      .set('x-access-token', token)
      .send(test_get)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('修改一条数据记录', function (done) {
    request.post('/data/petshop/pet/update')
      .set('x-access-token', token)
      .send(test_update)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('测试定义服务 /data/petshop/pet/all', function (done) {
    request.post('/data/petshop/pet/all')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body)
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('测试定义服务 /data/petshop/pet/searchName', function (done) {
    request.post('/data/petshop/pet/searchName')
      .set('x-access-token', token)
      .send({p0:'wsz'})
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body)
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('删除一条记录', function (done) {
    request.post('/data/petshop/pet/delete')
      .set('x-access-token', token)
      .send(test_delete)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

});