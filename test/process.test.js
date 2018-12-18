
var app = require('../index');
var should = require('should');
var KnexManager = require("./../db/KnexManager");
var UUID = require('uuid');

var req1 = {
  body : ""
}

var req2 = {
  body : {"p0":{"guid":UUID.v1(),"petid":2,"price":23,"amount":4}}
}

var req3 = {
  body : {"p0":{"guid":UUID.v1(),"petid":2,"price":13,"amount":6}}
}

var res = {
  json:function(message){
     console.log(message.code);
  }
}

describe('processManager.js 测试', function () {
  var processManager = require("../data/ProcessManager");
  processManager.init();

  after(function () {
    console.log("测试完成,关闭API服务器");
    KnexManager.destroy();
    app.close();
  });

  it('测试服务加载', function (done) {
      var processLoader = require("../data/ProcessLoader");
      var process = processLoader.loadProcess("petshop","get");
      should.exist(process);
      done();
  });

  it('测试 petshop get 服务',function(done){
    processManager.service("petshop","get",req1,res);
    done();
  })

  it('测试 petshop add 服务',function(done){
    processManager.service("petshop","add",req2,res);
    done();
  })

  it('测试 petshop total 服务',function(done){
    processManager.service("petshop","total",req3,res);
    done();
  })

});