//路由层

//导入路由控制器
const routerController = require(__basename + '/router_controller/routerController.js');

module.exports = app => {
  //验证邮箱验证码
  app.use(routerController.validMailCode);

  //验证token，验证登录
  app.use(routerController.validToken);

  //注册
  app.post('/register', routerController.register);

  //发送邮箱验证码
  app.post('/sendmail', routerController.sendMailCode);

  //登录
  app.post('/login', routerController.login);

  //获取商品类型
  app.get('/getType', routerController.getType);

  //修改商品类型状态
  app.post('/setTypeIsEnable', routerController.setTypeIsEnable);

  //修改商品类型
  app.post('/setType', routerController.setType);

  //添加商品类型
  app.post('/addType', routerController.addType);

  //获取商品类型数据总数
  app.get('/getTypePage', routerController.getTypePage);

  //获取搜索商品类型数据总数
  app.get('/getSearchTypePage', routerController.getSearchTypePage);

  //搜索商品类型
  app.get('/searchType', routerController.searchType);

  //删除商品类型
  app.post('/removeType', routerController.removeType);

  //获取未禁用的商品类型
  app.get('/getProType', routerController.getProType);

  //添加商品
  app.post('/addProduct', routerController.addProduct)

  //获取商品列表
  app.get('/getProduct', routerController.getProduct)

  //修改商品状态
  app.post('/setStatus', routerController.setStatus);

  //修改所有商品状态
  app.post('/setAllStatus', routerController.setAllStatus);

  //获取当前商品数据
  app.get('/getCurrProduct', routerController.getCurrProduct)

  //修改当前商品数据
  app.post('/setProduct', routerController.setProduct)

  //删除当前商品数据
  app.post('/removeProduct', routerController.removeProduct);

  //获取商品数据总数成功
  app.get('/getProductPage', routerController.getProductPage);

  //获取用户信息
  app.get('/getUserInfo', routerController.getUserInfo);

  //修改用户信息
  app.post('/setUserInfo', routerController.setUserInfo);

}