var ResCode = {
    OK : {'code':'000','message':'ok'},
    MetaAdd:'004',
    MetaAddNull:['005','提交的数据格式不正确'],
    MetaGet:'006',
    MetaUpdate:'007',
    MetaUpdateNull:['007','提交的数据格式不正确'],
    MetaDelete:'008',
    MetaServiceAdd:"001",
    MetaServiceDelete:"002",

    DataException : "020",

    DataValidateException:"021",

    ServiceException:"022",

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

// let test = new Map();
// test.set(1,"a1");
// test.set(2,"a2");
// test.set(3,"a3");
// test.set(4,"a4");
// let [key,value] = [null,null];
// for([key,value] of test){

// }
// console.log(key);
// console.log(value);

module.exports = ResCode