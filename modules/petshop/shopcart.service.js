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
            .updateRaw("pet", "age = age+1", "id =?", [id])
            .then(function (e) {
                reply.error(e).ok();
            })
    })
})

service('total', function (goods, db, reply) {
    reply.have(goods).have(goods.petid);
    let id = goods.petid;
    db.trx().insert("shopcart", goods).go(function(e){
        reply.error(e,"这里没有异常");
        db.updateRaw("pet", "age = age -1", "id =?", [id]).then(function(e){
            reply.error(e).ok();
        })
    })
})


service('get', function (db, reply) {
    db.select("shopcart").then(function (e, data) {
        reply.error(e).ok(data);
    })
})