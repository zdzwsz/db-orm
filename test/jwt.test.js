var should = require('should');
var webServer = require('../index');
var supertest = require('supertest');
var request = supertest(webServer.server);

describe('jwt.test - JWT 测试', function () {

  after(function () {
    console.log("测试完成,关闭API服务器");
    webServer.stop();
  });

  it('登陆成功取得token', function (done) {
    request.post('/auth')
      .send({ name: 'admin', password: '123456' })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('success', true);
        done(err);
      });
  });

  it('登陆失败，密码不对', function (done) {
    request.post('/auth')
      .send({ name: 'admin', password: '' })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('success', false);
        done(err);
      });
  });

  it('登陆失败，用户不对', function (done) {
    request.post('/auth')
      .send({ name: 'admin1', password: '123456' })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('success', false);
        done(err);
      });
  });

  it('访问受保护资源，返回错误信息', function (done) {
    request.post('/meta/get')
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('success', false);
        done(err);
      });
  });

});