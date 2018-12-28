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
        { "name": "resume","type:"table","relation":{<br>
            "tableName":"test_resume",<br>
            "primary::"id",<br>
            "fields":[<br>
                {"name":"id","type":"int"},<br>
                {"name":"startTime","type":"dateTime"},<br>
                {"name":"stopTime","type":"dateTime"},<br>
                {"name":"detail","type":"string"}<br>
            ]<br>
        }}<br>
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

<br>
todo:<br>
1、数据更改热启动，（over）<br>
2、多种数据类型保存测试与完善（over）<br>
--a、自增量, int 转 增量<br>
--b、日期格式处理<br>
--c、string 转 int ，string 转 date（不做了，由业务判断）<br>

3、子从表增删改查，meta和data。（over）<br>
4、启动进行表与json同步（暂时不做了）<br>
一、增量模式<br>
如果表不存在，则新增表。如果表存在，如果表是空表，进行删除再新增，如果不是空表，则检查列，如果列不存在，则增加列，如果存在，只是更改长度（短改长）。（符合已经在运行的系统升级）<br>
二、全量模式<br>
如果表不存在，则新增表，否则，删除表再新增表。最后将策略改为增量模式。（符合新系统）<br>
5、多级权限，改meta需要二次验证。<br>
开发完成，即发布v0.1版本。

