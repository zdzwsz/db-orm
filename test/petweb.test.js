var should = require('should');
var app = require('../index');
var supertest = require('supertest');
var request = supertest(app);
var KnexManager = require("./../db/KnexManager");
var UUID = require('uuid');


describe('pet 业务服务测试', function () {
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

  it('购物车增加商品', function (done) {
    var test_add = {"guid":UUID.v1(),"petid":2,"price":23,"amount":4};
    request.post('/data/petshop/add')
      .set('x-access-token', token)
      .send(test_add)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('购物车-得到商品', function (done) {
    request.post('/data/petshop/get')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('购物车-统计商品', function (done) {
    var test_add = {"p0":{"guid":UUID.v1(),"petid":2,"price":1,"amount":1}};
    request.post('/data/petshop/total')
      .set('x-access-token', token)
      .send(test_add)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

});