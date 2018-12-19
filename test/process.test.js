
var app = require('../index');
var should = require('should');
var KnexManager = require("./../db/KnexManager");
var UUID = require('uuid');
var logger = require("../log");

var res = {
  json:function(message){
     logger.debug(message.code);
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
    var req = {
      body : ""
    }
    processManager.service("petshop","get",req,res);
    done();
  })

  it('测试 petshop add 服务',function(done){
    var req = {
      body : {"p0":{"guid":UUID.v1(),"petid":2,"price":23,"amount":4}}
    }
    processManager.service("petshop","add",req,res);
    done();
  })

  it('测试 petshop total 服务',function(done){
    var req = {
      body : {"p0":{"guid":UUID.v1(),"petid":2,"price":13,"amount":6}}
    }
    processManager.service("petshop","total",req,res);
    done();
  })

  it('测试 petshop param 变参数测试',function(done){
    var req = {
      body : {"p0":1,"p1":{name:"zdzwsz"}}
    }
    processManager.service("petshop","param",req,res);
    done();
  })

});