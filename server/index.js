//入口层

//设置基本路径, global表示全局对象，全局属性可以省略global
global.__basename = __dirname;

//导入配置
global.config = require(__basename + '/config/config.js');

//连接mysql数据库, 使用全局属性保存连接实例，以便后续创建数据模型(数据库结构)
global.sequelize = require(__basename + '/db/connection.js');

//导入所有模型
global.model = require(__basename + '/db/model/model.js');

//导入express
const express = require('express');

//导入body-parser模块
const bodyParser = require('body-parser');

//导入白名单
global.whileList = require(__basename + '/white_list/whiteList.js');

//导入路由
const router = require(__basename + '/router/router.js');

//创建express实例
let app = express();

//设置静态目录
app.use(express.static(__basename + '/upload'));

//设置解析post请求体
//将请求题解析为json格式
app.use(bodyParser.json({
  //限制请求体大小kb
  limit: config.requestBodyOptions.limit
}));

//extended: false可以接受任何数据类型，true: 可以接受字符串或者数组
app.use(bodyParser.urlencoded({
  extended: false,
  limit: config.requestBodyOptions.limit
}))

//CORS 跨域资源共享
//app.all(*)表示所有请求路径必须经过
app.all('*', (req, res, next) => {

  //允许跨域地址
  res.header("Access-Control-Allow-Origin", req.headers.origin);

  //*表示允许所有域请求，在实际开发中，一般指定允许某个域请求，如上面设置
  // res.header("Access-Control-Allow-Origin", "*");

  //如果浏览器请求包括Access-Control-Request-Headers字段，则Access-Control-Allow-Headers字段是必需的。它也是一个逗号分隔的字符串，表明服务器支持的所有头信息字段，不限于浏览器在"预检"中请求的字段。
  res.header("Access-Control-Allow-Headers", "X-Requested-With");

  //该字段必需，它的值是逗号分隔的一个字符串，表明服务器支持的所有跨域请求的方法。注意，返回的是所有支持的方法，而不单是浏览器请求的那个方法。这是为了避免多次"预检"请求。
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");

  //该字段可选。它的值是一个布尔值，表示是否允许发送Cookie。默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器明确许可，Cookie可以包含在请求中，一起发给服务器。这个值也只能设为true，如果服务器不要浏览器发送Cookie，删除该字段即可
  res.header("Access-Control-Allow-Credentials", true);

  //允许通过
  next();

});

//验证跨域地址是否载白名单
app.use((req, res, next) => {
  //跨域白名单验证
  if (whileList.hostList.indexOf(req.headers.origin) === -1) {
    return res.send({ msg: '请求域不合法' });
  }

  //允许通过
  next();
})

//加载路由
router(app);

//监听端口
app.listen(config.serverOptions.port, () => {
  console.log(`the server running at ${config.serverOptions.host}:${config.serverOptions.port}`);
})