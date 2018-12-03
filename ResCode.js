var ResCode = {
    OK : {'code':'000','message':'ok'},
    MetaAdd:'004',
    MetaAddNull:['005','提交的数据格式不正确'],
    MetaGet:'006',
    MetaUpdate:'007',
    MetaDelete:'008',
    MetaServiceAdd:"001",
    MetaServiceDelete:"002",

    error:function(type,e){
          if(Array.isArray(type)  && typeof(e) == 'undefined'){
            return {'code':type[0],'message':type[1]};
          }
          return {'code':type,'message':e};
    },

    data:function(data){
       return {'code':'000','data':data};
    }

}

module.exports = ResCode