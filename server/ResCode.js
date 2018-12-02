var ResCode = {
    OK : {'code':'000','message':'ok'},
    MetaAdd:'005',
    MetaGet:'006',
    MetaUpdate:'007',
    MetaDelete:'008',
    MetaServiceAdd:"001",
    MetaServiceDelete:"002",
    error:function(type,e){
          return {'code':type,'message':e}
    },

    data:function(data){
       return {'code':'000','data':data};
    }

}

module.exports = ResCode