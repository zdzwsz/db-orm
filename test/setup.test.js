var should = require('should');
var webServer = require('../index');
var supertest = require('supertest');
var request = supertest(webServer.server);

describe.skip('setup.test - 配置 测试', function () {
  let token = null;
  after(function () {
    request.post('/setup/pwd')
      .set('x-access-token', token)
      .send({ user: { oldPassword: '1234567', newPassword: '123456' } })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        console.log("测试完成,关闭API服务器");
        webServer.stop();
      });
  });

  before(function () {
    return request.post('/metaAuth')
      .send({ name: 'admin', password: '123456' })
      .then(function (res) {
        token = res.body.token;
      });
  });

  it('更改meta密码，但是老密码错误，更新不成功', function (done) {
    request.post('/setup/pwd')
      .set('x-access-token', token)
      .send({ user: { oldPassword: '1234567890', newPassword: '1234567' } })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body);
        res.body.should.have.property('code', '001');
        done();
      });
  });

  it('更改meta密码，输入正确老密码', function (done) {
    request.post('/setup/pwd')
      .set('x-access-token', token)
      .send({ user: { oldPassword: '123456', newPassword: '1234567' } })
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        console.log(res.body);
        res.body.should.have.property('code', '000');
        setTimeout(done,100);
      });
  });

  it('验证更改的密码，输入错误密码', function (done) {
     request.post('/auth')
      .send({ name: 'admin', password: '123456' })
      .then(function (res) {
        res.body.should.have.property('success', false);
        done();
      });
  });

  it('验证更改的密码，输入正确密码', function (done) {
     request.post('/auth')
      .send({ name: 'admin', password: '1234567' })
      .then(function (res) {
        res.body.should.have.property('success', true);
        done();
      });
  });

});