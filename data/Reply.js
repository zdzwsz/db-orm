var UUID = require('uuid');
var EventEmitter = require('events').EventEmitter;
const logger = require("./../log")

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
            this.emit(this.eventName,message||"Object does not exist");
        }
        return this;
    }

    nothave(o,message){
        if(o && o!=null){
            logger.error(o);
            this.emit(this.eventName,message||"Object existence");
        }
        return this;
    }

    gt(v1,v2,message){
        if(v1 < v2){
            this.emit(this.eventName,message|| v1 +" value must > " + v2);
        }
        return this;
    }

    gteq(v1,v2,message){
        if(v1 <= v2){
            this.emit(this.eventName,message|| v1 +" value must => " + v2);
        }
        return this;
    }

    lt(v1,v2,message){
        if(v1 > v2){
            this.emit(this.eventName,message|| v1 +" value must < " + v2);
        }
        return this;
    }

    lteq(v1,v2,message){
        if(v1 >= v2){
            this.emit(this.eventName,message|| v1 +" value must <= " + v2);
        }
        return this;
    }

    eq(v1,v2,message){
        if(v1 != v2){
            this.emit(this.eventName,message|| v1 +" value must equals " + v2);
        }
        return this;
    }

    noteq(v1,v2,message){
        if(v1 === v2){
            this.emit(this.eventName,message|| v1 +" value must not equals " + v2);
        }
        return this;
    }

    ok(data){
        logger.debug(data);
        this.emit(this.eventName,data);
    }

}
module.exports = Reply;