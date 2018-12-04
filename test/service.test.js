
var supertest = require('supertest');
var should = require('should');
var app = require('../index');
var request = supertest(app);

var test_data = '_test_servive__';

describe('业务分类 测试', function () {
    var token = null;

    before(function(){
        return request.post('/auth')
        .send({name: 'admin',password:'123456'})
        .then(function (res) {
            token = res.body.token;
        });
    });

   after(function(){
      console.log("测试完成,关闭API服务器");
      app.close();
   });

  it('建立业务分类', function (done) {
    request.post('/meta/'+ test_data +'/add')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

  it('删除业务分类', function (done) {
    request.post('/meta/'+ test_data +'/delete')
      .set('x-access-token', token)
      .expect('Content-Type', /json/)
      .end(function (err, res) {
        should.not.exist(err);
        res.body.should.have.property('code', '000');
        done(err);
      });
  });

});