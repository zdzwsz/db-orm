var should = require('should');
var test_data = '_test_servive__';
var webServer = require('../index');
var supertest = require('supertest');
var request = supertest(webServer.server);

var codeBase64 = "c2VydmljZSgncGFyYW0nLCBmdW5jdGlvbiAodjEsIHYyLCB2MywgZGIsIHJlcGx5KSB7CiAgICBzbG9nLmluZm8oInYxIHZhbHVlIGlzOiIgKyB2MSk7CiAgICBzbG9nLmluZm8oInYyIHZhbHVlIGlzOiIgKyB2Mik7CiAgICBzbG9nLmluZm8oInYzIHZhbHVlIGlzOiIgKyB2Myk7CiAgICByZXBseS5vaygpOwp9KQ=="

describe('业务分类 测试', function () {
  var token = null;
 
  before(function () {
    return request.post('/auth')
      .send({ name: 'admin', password: '123456' })
      .then(function (res) {
        token = res.body.token;
      });
  });

  after(function () {
    console.log("测试完成,关闭API服务器");
    webServer.stop();
  });

  it('获取所有业务分类', function (done) {
    request.post('/meta/all')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('获取petshop所有业务实体', function (done) {
    request.post('/meta/petshop/entity')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('获取petshop所有业务服务', function (done) {
    request.post('/meta/petshop/ws')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });


  it('新增petshop test业务代码', function (done) {
    request.post('/meta/petshop/scode')
      .set('x-access-token', token)
      .send({"name":"test","code":codeBase64})
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('获取petshop test业务代码', function (done) {
    request.post('/meta/petshop/gcode')
      .set('x-access-token', token)
      .send({"name":"test"})
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('删除petshop test业务代码', function (done) {
    request.post('/meta/petshop/dcode')
      .set('x-access-token', token)
      .send({"name":"test"})
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('建立业务分类', function (done) {
    request.post('/meta/' + test_data + '/add')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('删除业务分类', function (done) {
    request.post('/meta/' + test_data + '/delete')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

});