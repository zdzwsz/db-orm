/**
 * global service
 */
service('add', function (goods, db, reply) {
    reply.have(goods).have(goods.petid);
    let id = goods.petid;
    db.get("pet", "id = ?", [id]).then(function (e, pet) {
        reply.error(e)
            .have(pet, "宠物不存在")
            .gt(pet.age, 1, "宠物已经卖完了");
        db.trx().insert("shopcart", goods)
            .updateRaw("pet", "age = age -1", "id =?", [id])
            .then(function (e) {
                reply.error(e).ok();
            })
    })
})

service('total', function (goods, db, reply) {
    reply.have(goods).have(goods.petid);
    let id = goods.petid;
    db.trx().insert("shopcart", goods).go(function (e) {
        reply.error(e);
        db.updateRaw("pet", "age = age -1", "id =?", [id]).then(function (e) {
            reply.error(e).ok();
        })
    })
})


service('get', function (db, reply) {
    db.select("shopcart").then(function (e, data) {
        reply.error(e).ok(data);
    })
})

//变参数测试
service('param', function (v1, v2, v3, db, reply) {
    slog.info("v1 value is:" + v1);
    slog.info("v2 value is:" + v2);
    slog.info("v3 value is:" + v3);
    reply.ok();
})