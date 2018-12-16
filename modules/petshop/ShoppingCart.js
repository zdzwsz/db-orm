//db,logger,service
/**
 * global db,logger,service
 */
service('/add', function (goods, reply) {
    let id = goods.id;
    db.select("pet","id = ?",[id]).then(function(e,pet){
        reply.have(e);
        reply.null(pet,"宠物不存在");
        reply(pet.age).lt(1,"宠物已经卖了");//gt(greater than):> , lt(less than)< ,eq(equal)
        db.insert(shopcart,goods).then(function(e){
            reply.ok(e);
        })
    })
})

service('/get', function (reply) {
    db.select("shopcart").then(function(e,data){
        reply.ok(e,data);
    })
})