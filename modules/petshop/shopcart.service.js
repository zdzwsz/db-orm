//db,logger,service
/**
 * global db,logger,service
 */
service('add', function (goods,db,reply) {
    reply.have(goods).have(goods.petid);
    let id = goods.petid;
    db.select("pet", "id = ?", [id]).then(function (e, pet) {
        reply.nothave(e)
            .have(pet, "宠物不存在")
            .gt(pet.age, 0, "宠物已经卖了");
        db.insert("shopcart", goods)
            .update("pet", "age = age -1", "id =?", [id])
            .then(function (e) {
                reply.nothave(e).ok();
            })
    })
})

service('get', function (db,reply) {
    db.select("shopcart").then(function (data) {
        reply.ok(data);
    })
})