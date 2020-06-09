# merchantFile
商家商品管理系统

1.分别在merchant和server文件夹 $ npm i 下载依赖  

2.修改本地服务器server文件夹里面的config文件夹下的config.js  

  (1)修改数据库配置的用户名以及密码  
  
  (2)修改发邮件配置的host和auth  
  

### 项目描述:  
本项目是一个基于Vue+node，商家可以在该系统中进行添加、查看、编辑、删除商品类型和商品的操作，还可以快速搜索商品类型和商品，还可以通过紧急下架以防意外特殊情况造成损失
### 责任描述:  
1)	负责整个项目的架构和开发，通过vue-cli3快速搭建开发环境，通过node搭建本地服务器  

2)	使用express模块快速搭建web服务器  

3)	使用sequelize框架进行MySQL操作  

4)	使用body-parser中间件处理post请求体  

5)	使用nodemailer模块发送注册账号的邮箱验证码  

6)	使用fs文件系统模块把图片写入服务器和删除服务器图片  

7)	使用jsonwebtoken模块生成token，登录成功后发送token结合vue-cookies保存token。服务器编写token验证中间件，对需要进行token验证的白名单请求，进行token验证  

8)	使用axios跨域请求数据，使用Element-ui库快速编写页面  


### 项目部分功能图片展示:  

![Image](https://github.com/yujinxings/merchantFile/blob/master/images/1.png)![Image](https://github.com/yujinxings/merchantFile/blob/master/images/2.png)![Image](https://github.com/yujinxings/merchantFile/blob/master/images/3.png)![Image](https://github.com/yujinxings/merchantFile/blob/master/images/4.png)![Image](https://github.com/yujinxings/merchantFile/blob/master/images/5.png)![Image](https://github.com/yujinxings/merchantFile/blob/master/images/6.png)![Image](https://github.com/yujinxings/merchantFile/blob/master/images/7.png)![Image](https://github.com/yujinxings/merchantFile/blob/master/images/8.png)
