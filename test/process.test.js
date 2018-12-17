
var app = require('../index');
var should = require('should');

var req = {
  body : ""
}

var res = {
  json:function(message){
     console.log(message);
  }
}

describe.only('processManager.js 测试', function () {

  after(function () {
    console.log("测试完成,关闭API服务器");
    app.close();
  });

  it('测试服务加载', function (done) {
      var processLoader = require("../data/ProcessLoader");
      processLoader.init();
      var process = processLoader.loadProcess("petshop","get");
      should.exist(process);
      done();
  });

  it('测试 petshop get 服务',function(done){
    var processManager = require("../data/ProcessManager");
    processManager.init();
    processManager.service("petshop","get",req,res);
    done();
  })

});