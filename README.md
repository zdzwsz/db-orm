本微应用是使用nodejs技术，融合其他组件，开发一个微数据库服务工具，直接将数据库映射成微服务。<br>
1、webservice规则：<br>
/meta/服务名/add，/meta/服务名/get，/meta/服务名/update，/meta/服务名/del<br>
/data/服务名/add，/data/服务名/get，/data/服务名/update，/data/服务名/del

服务返回结果：<br>
执行正确结果：{"code":'000','message':'信息描述',......}<br>
执行错误结果：{"code":'001','message':'信息描述',......} code值不等于000，就是错误<br>

2、启动服务，node ./server/index.js<br>

3、配置文件：server/config.js<br>
   数据 json 配置设置为自己文件夹的目录。<br>
