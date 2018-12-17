//db,logger,service
/**
 * global db,logger,service
 */
service('add', function (goods,db,reply) {
    
    reply.have(goods).have(goods.petid);
    let id = goods.petid;
    db.select("pet", "id = ?", [id]).then(function (e, pets) {
        let pet = pets[0];
        console.log(pet);
        reply.error(e)
            .have(pet, "宠物不存在")
            .gt(pet.age, 1, "宠物已经卖了");
        // db.insert("shopcart", goods)
        //     .update("pet", "age = age -1", "id =?", [id])
        //     .then(function (e) {
        //         reply.error(e).ok();
        //     })
        reply.ok();
    })
})

service('get', function (db,reply) {
    db.select("shopcart").then(function (e,data) {
        reply.error(e).ok(data);
    })
})