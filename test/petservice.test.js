var KnexManager = require("../db/KnexManager");
var PetService = require("../modules/petshop/PetService")
var app = require('../index');
var should = require('should');

tableName = 'pet';
primary = 'id';


describe('PetService 测试例子 增删改查操作 测试', function () {
    var service = new PetService(tableName, primary)
    after(function (done) {
        this.timeout(4000);
        KnexManager.destroy();
        app.close();
        done();

    })

    it('增加数据 PetService.add', function (done) {
        this.timeout(3000);
        service.add({ id: 99, name: 'wsz', age: 12 }, function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('查询数据 PetService.get', function (done) {
        this.timeout(3000);

        service.get(99, function (e, data) {
            should.not.exist(e);
            data.should.have.property('name', 'wsz');
            done(e);
        })
    })

    it('更新数据 PetService.update', function (done) {
        this.timeout(3000);

        service.update({ id: 99, name: 'wsz', age: 24 }, function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('多sql语句执行 PetService.execSql', function (done) {
        this.timeout(3000);
        let sqls = ["update " + tableName + " set name =? where id =?",
        "update " + tableName + " set age =? where id =?",
        "update pet set age =? where id =?"
        ];
        let ps = [["321", 99],[99, 99],[98, 99]];
        service.execSql(sqls, ps, function (e) {
            should.not.exist(e);
            done(e);
        })
    })

    it('删除数据 PetService.delete', function (done) {
        this.timeout(3000);
        service.delete(99, function (e) {
            should.not.exist(e);
            done(e);
        })
    })

})