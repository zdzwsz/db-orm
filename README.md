本微应用是使用nodejs技术，融合其他组件，开发一个微数据库服务工具，直接将数据库映射成微服务。<br>
1、webservice规则：<br>
/meta/服务名/add，/meta/服务名/get，/meta/服务名/update，/meta/服务名/delete<br>
/data/服务名/add，/data/服务名/get，/data/服务名/update，/data/服务名/delete

服务返回结果：<br>
执行正确结果：{"code":'000','message':'信息描述',......}<br>
执行返回结果：{"code":'000','data':'{ json 格式 }',......}<br>
执行错误结果：{"code":'001','message':'信息描述',......} code值不等于000，就是错误<br>

2、启动服务，node ./server/index.js<br>

3、配置文件：server/config.js<br>
   数据 json 配置设置为自己文件夹的目录。<br>

4、元数据json 格式：<br>
{<br>
    "tableName":"test_sys_users",<br>
    "primary":"id",<br>
    "fields":[<br>
        { "name": "id", "type": "int" }, <br>
        { "name": "name", "type": "string" ,"length" : 12,"notNullable":true}, <br>
        { "name": "age", "type": "int" ,"default": 10},<br>
        { "name": "birthday","type":"dateTime"},<br>
        { "name": "salary","type":"float","length":[10,2]},<br>
        { "name": "crete_data","type":"timestamp"},<br>
        { "name": "assets","type":"decimal","length":[8]},<br>
        { "name": "type","type":"string","length":2,"default": "0"}<br>
    ]<br>
}<br>

5、元数据修改 格式：<br>
{<br>
    "r_primary":"name",<br>
    "add":[<br>
        { "name":"pic", "type":"string","length":255}<br>
    ],<br>
    "update":{<br>
       "age":{"name": "ages", "type": "string"}<br>
    },<br>
    "delete":[<br>
        "crete_data"<br>
    ]<br>
}<br>
目前不支持修改表的名称
