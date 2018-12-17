var UUID = require('uuid');
var EventEmitter = require('events').EventEmitter;
const code = require("./ReplyCode.json")

class Reply extends EventEmitter {
    constructor() {
        super();
        let id = UUID.v1();
        this.eventName = "reply_event"+id;
    }

    end(callback) {
        this.once(this.eventName, callback);
    }

    have(o,message){
        if(typeof(o) == "undefined" || o ==null){
            this.emit(this.eventName,this.createException(code.null,message));
        }
        return this;
    }

    nothave(o,message){
        if(o && o!=null){
            this.emit(this.eventName,this.createException(code.notnull,message));
        }
        return this;
    }

    gt(v1,v2,message){
        if(v1 < v2){
            this.emit(this.eventName,this.createException(code.compare,message|| v1 +" value must > " + v2));
           
        }
        return this;
    }

    gteq(v1,v2,message){
        if(v1 <= v2){
            this.emit(this.eventName,this.createException(code.compare,message|| v1 +" value must => " + v2));
           
        }
        return this;
    }

    lt(v1,v2,message){
        if(v1 > v2){
            this.emit(this.eventName,this.createException(code.compare,message|| v1 +" value must < " + v2));
           
        }
        return this;
    }

    lteq(v1,v2,message){
        if(v1 >= v2){
            this.emit(this.eventName,this.createException(code.compare,message|| v1 +" value must <= " + v2));
          
        }
        return this;
    }

    eq(v1,v2,message){
        if(v1 != v2){
            this.emit(this.eventName,this.createException(code.equals,message|| v1 +" value must equals " + v2));
            
        }
        return this;
    }

    noteq(v1,v2,message){
        if(v1 === v2){
            this.emit(this.eventName,this.createException(code.notequals,message|| v1 +" value must not equals " + v2));
           
        }
        return this;
    }

    ok(data){
        this.emit(this.eventName,this.createData(data));
    }

    error(e){
        if(e != null && typeof(e) == "object"){
            this.emit(this.eventName,this.createError(e));
        }
        return this;
    }

    createException(index,message){
        return {"code":index[0],message:index[1],data:message}
    }

    createData(data){
        return {"code":code.ok[0],"data":data};
    }

    createError(e){
        return {"code":code.error,"data":e};
    }

}
module.exports = Reply;