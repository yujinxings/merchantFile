//路由控制器层

//导入api(服务)层，操作数据库
let api = require(__basename + '/api/api.js');

//导入工具库, 公共方法
let utils = require(__basename + '/utils/utils.js');

//导入moment模块，用于处理日期时间
const moment = require('moment');

//导入文件系统模块
const fs = require('fs')

//导入sequelize模块
const Sequelize = require('sequelize');

//获取sequelize操作符模块
let Op = Sequelize.Op;

class RouterController {
  //验证邮箱验证码, 中间件
  validMailCode(req, res, next) {
    if (whileList.mailList.indexOf(req.url) > -1) {
      //需要验证邮箱验证码,根据邮箱和验证码查询
      //获取当前时间减去邮箱验证的过期时间
      let currentTime = new Date().getTime() - 5 * 60 * 1000;

      //使用moment处理日期时间
      let date = moment(currentTime).format('YYYY-MM-DD HH:mm:ss');
      //查询验证码是否正确
      console.log(req.body);

      api.findData('Code', {
        email: req.body.email,
        code: req.body.code,
        createdAt: {
          [Op.gte]: date
        }
      }).then(result => {
        if (result.length == 0) {
          res.send({
            msg: '验证码已失效或者不正确',
            code: 1013
          });
        } else {
          //验证码验证通过
          next();
        }
      }).catch(err => {
        console.log('err ==> ', err);
        res.send({
          msg: '邮箱验证码验证失败',
          code: 1012
        });
      })
    } else {
      //不需要验证邮箱验证码
      next();
    }

  }

  //验证token,登录验证
  validToken(req, res, next) {
    console.log(req.url);

    let url = req.url.split('?')[0];

    if (whileList.tokenList.indexOf(url) > -1) {
      console.log('需要验证token');

      if (!req.headers.cookie) {
        res.send({ msg: '请先登录', code: 1014 })
      }

      let cookies = utils.transformCookie(req.headers.cookie);

      if (!cookies._abc) {
        res.send({ msg: '请先登录', code: 1014 })
      }
      //解析token
      utils.verifyString({
        value: cookies._abc,
        salt: config.tokenOptions.tokenSalt,
        fn: (err, decoded) => {
          console.log('err ==> ', err);
          if (err) {
            //如果解析失败
            res.send({
              msg: '请先登录',
              code: 1014
            });
          } else {
            //token验证通过
            console.log('token验证通过');
            //将userId传递给下一个中间件或者路由的req请求对象
            req.userId = decoded.data;
            next();
          }
        }
      })
    } else {
      //不需要验证token，直接通过
      console.log('不需要验证token，直接通过');
      next();
    }
  }

  //注册
  register(req, res) {
    //查询该邮箱是否被注册
    api.findData('Business', {
      email: req.body.email
    }).then(result => {
      console.log('result ==> ', result);
      if (result.length == 0) {
        //该邮箱没有被注册
        //生成userId
        let userId = '_b' + new Date().getTime();

        //密码加盐加密
        let password = utils.encodeString(config.saltOptions.passwordSalt + req.body.password);

        //添加数据
        api.createData('Business', {
          userId,
          nickname: req.body.nickname,
          password,
          email: req.body.email
        }).then(result => {
          res.send({
            msg: '注册成功',
            code: 1000
          });
        }).catch(err => {
          console.log('err ==> ', err);
          res.send({
            msg: '注册失败',
            code: 1001
          });
        })
      } else {
        res.send({
          msg: '该邮箱已经被注册',
          code: 1002
        });
      }
    }).catch(err => {
      res.send({
        msg: '注册失败',
        code: 1001
      });
    })

  }

  //发送邮箱验证码
  sendMailCode(req, res) {
    //存储验证码
    //取随机数后面六位数字
    let code = Math.random().toString().slice(-6);
    console.log('我的', req.body);

    api.createData('Code', {
      email: req.body.email,
      code
    }).then(result => {
      // res.send({
      //   msg: '验证码已发至您邮箱',
      //   code: 1010
      // });
      // return;
      //开发测试阶段不发邮件
      utils.sendMail(req.body.email, code, (err, info) => {
        if (err) {
          //如果发邮件失败
          console.log(err, 'req.body', req.body.email, 'code', code);
          res.send({
            msg: '发送邮箱验证码失败',
            code: 1011
          });
        } else {
          // console.log('info ==> ', info);
          res.send({
            msg: '验证码已发送至您的邮箱,请注意查收',
            code: 1010
          });
        }
      });
    }).catch(err => {
      console.log('err ==> ', err);
      res.send({
        msg: '发送邮箱验证码失败',
        code: 1011
      })
    })

  }

  //登录
  login(req, res) {
    //根据邮箱查询
    api.findData('Business', {
      email: req.body.email,
      isDestroy: 0
    }, ['userId', 'password']).then(result => {

      //如果没有查询到数据
      if (result.length == 0) {
        res.send({
          msg: '用户不存在',
          code: 1022
        });
      } else {
        //如果存在用户，则需要验证密码是否正确
        let password = utils.encodeString(config.saltOptions.passwordSalt + req.body.password);
        if (password == result[0].dataValues.password) {
          //如果密码正确
          //生成token
          let token = utils.signString({
            value: result[0].dataValues.userId,
            salt: config.tokenOptions.tokenSalt,
            expires: config.tokenOptions.expires
          });
          res.send({
            msg: '登录成功',
            code: 1020,
            token
          });
        } else {
          res.send({
            msg: '邮箱或者密码不正确',
            code: 1023
          });
        }
      }
    }).catch(err => {
      console.log('err ==> ', err);
      res.send({
        msg: '登录失败',
        code: 1021
      });
    })

  }

  //获取商品类型
  getType(req, res) {
    api.findData('Type', {
      userId: req.userId
    }, '', ['updatedAt', 'DESC'], req.query.offset - 0, req.query.limit - 0).then(result => {
      console.log(result);

      res.send({
        msg: '获取商品类型成功',
        result,
        code: 1030
      })
    }).catch(err => {
      res.send({
        msg: '获取商品类型失败',
        code: 1031
      })
    })
  }

  //修改商品类型状态
  setTypeIsEnable(req, res) {
    api.updateData('Type', { isEnable: req.body.isEnable - 0 }, {
      typeId: req.body.typeId
    }).then(result => {
      res.send({ msg: '修改商品类型状态成功', code: 1032, result })
    }).catch(err => {
      res.send({ msg: '修改商品类型状态失败', code: 1033 })
    })
  }

  //修改商品类型
  setType(req, res) {
    api.updateData('Type', { type: req.body.type }, {
      typeId: req.body.typeId
    }).then(result => {
      res.send({ msg: '修改商品类型成功', code: 1034, result })
    }).catch(err => {
      res.send({ msg: '修改商品类型失败', code: 1035 })
    })
  }

  //添加商品类型
  addType(req, res) {
    let typeId = '_ty' + new Date().getTime()
    api.createData('Type', {
      typeId,
      type: req.body.type,
      userId: req.userId
    }).then(result => {
      res.send({
        msg: '添加商品类型成功',
        code: 1036,
        result
      })
    }).catch(err => {
      console.log('添加商品类型失败 err==>', err);
      res.send({
        msg: '添加商品类型失败',
        code: 1037
      })
    })
  }

  //获取商品类型数据总数
  getTypePage(req, res) {
    api.count('Type', {
      userId: req.userId,
    }).then(result => {
      res.send({ msg: '获取数据总数成功', code: 1038, result })
    }).catch(err => {
      res.send({ msg: '获取数据总数失败', code: 1039 })
    })
  }

  //获取搜索商品类型数据总数
  getSearchTypePage(req, res) {
    api.count('Type', {
      userId: req.userId,
      type: {
        [Op.like]: `%${req.query.type}%`
      }
    }).then(result => {
      res.send({ msg: '获取搜索数据总数成功', code: 1042, result })
    }).catch(err => {
      res.send({ msg: '获取搜索数据总数失败', code: 1043 })
    })
  }

  //搜索商品类型
  searchType(req, res) {
    api.findData('Type', {
      userId: req.userId,
      type: {
        [Op.like]: `%${req.query.type}%`
      }
    }, '', ['updatedAt', 'DESC'], req.query.offset - 0, req.query.limit - 0).then(result => {
      res.send({ msg: '搜索成功', code: 1040, result })
    }).catch(err => {
      res.send({ msg: '搜索失败', code: 1041 })
    })
  }

  //删除商品类型数据
  removeType(req, res) {
    api.destroyData('Type', {
      userId: req.userId,
      typeId: req.body.typeId
    }).then(result => {
      res.send({ msg: '删除商品类型成功', code: 1044, result })
    }).catch(err => {
      res.send({ msg: '删除商品类型失败', code: 1045 })
    })
  }

  //获取未禁用的商品类型
  getProType(req, res) {
    api.findData('Type', {
      userId: req.userId,
      isEnable: 1
    }, ['typeId', 'type']).then(result => {
      res.send({ msg: '获取商品类型成功', code: 1058, result });
    }).catch(err => {
      res.send({ msg: '获取商品类型失败', code: 1059 });
    })
  }

  //添加商品
  addProduct(req, res) {
    //获取图片base64 传递过来的base64会把+号变成空格需要重新转换为+号
    let imgBase64 = req.body.img.replace(/ /g, '+')
    let buffer = new Buffer(imgBase64, 'base64')
    let fileName = Math.random().toString().slice(2) + '.' + req.body.imgType
    //使用文件系统平台base64写入服务器
    fs.writeFile(__basename + '/upload/' + fileName, buffer, err => {
      if (err) {//上传失败
        req.send({ msg: '添加商品失败', code: 1051 })
      } else {
        req.body.img = fileName
        delete req.body.imgType //删除图片格式
        //生成商品id
        req.body.pid = '_pro' + new Date().getTime();
        //关联用户
        req.body.userId = req.userId;
        api.createData('Product', req.body).then(result => {
          res.send({ msg: '商品发布成功', code: 1050, result })
        }).catch(err => {
          res.send({ msg: '商品发布失败', code: 1051 })
        })
      }
    })
  }

  //获取商品列表
  getProduct(req, res) {
    //查询添加
    let condition = {
      userId: req.userId,
      offset: req.query.offset - 0,
      limit: req.query.limit - 0
    }

    let sql = "SELECT `p`.`pid`,`p`.`name`,`p`.`price`,`p`.`img`,`t`.`type`,`p`.`status`,`p`.`created_at`,`p`.`updated_at` FROM `product` AS `p` INNER JOIN `type` AS `t` ON `p`.`type_id`=`t`.`type_id` AND `p`.`user_id`=:userId"
    //根据条件添加模糊查询
    if (req.query.name) {
      condition.name = '%' + req.query.name + '%';
      sql += " AND `p`.`name` LIKE :name";
    }
    if (req.query.typeId) {
      condition.typeId = req.query.typeId;
      sql += " AND `p`.`type_id` = :typeId";
    }
    if (req.query.status) {
      condition.status = req.query.status - 0;
      sql += " AND `p`.`status` = :status";
    }

    //按更新时间排序 分页查询
    sql += " ORDER BY `p`.`updated_at` DESC LIMIT :offset, :limit"

    api.query(sql, condition).then(result => {
      res.send({ msg: '获取商品成功', code: 1052, result })
    }).catch(err => {
      console.log(err);

      res.send({ msg: '获取商品失败', code: 1053 })
    })
  }

  //修改商品状态 上/下架
  setStatus(req, res) {
    api.updateData('Product', {
      status: req.body.status
    }, {
      pid: req.body.pid,
      userId: req.userId
    }).then(result => {
      res.send({ msg: '修改商品状态成功', code: 1054, result });
    }).catch(err => {

      res.send({ msg: '修改商品状态失败', code: 1055 });
    })
  }

  //修改所有商品状态 上/下架
  setAllStatus(req, res) {
    api.updateData('Product', {
      status: req.body.status
    }, {
      userId: req.userId
    }).then(result => {
      res.send({ msg: '修改所有商品状态成功', code: 1056, result });
    }).catch(err => {
      res.send({ msg: '修改所有商品状态失败', code: 1057 });
    })
  }

  //获取当前商品数据
  getCurrProduct(req, res) {
    api.findData('Product', {
      userId: req.userId,
      pid: req.query.pid
    }, [
      'name', 'price', 'img', 'status', 'typeId'
    ]).then(result => {
      res.send({ msg: '获取商品当前数据成功', code: 1060, result })
    }).catch(err => {
      res.send({ msg: '获取商品当前数据失败', code: 1061 })
    })
  }

  //修改当前商品数据
  setProduct(req, res) {
    function updateProduct(name) {
      let pid = req.body.pid
      delete req.body.pid
      api.updateData('Product', req.body, {
        pid,
        userId: req.userId
      }).then(result => {
        if (name) {
          fs.unlink(__basename + '/upload/' + name, function (err) {
            if (err) {
              console.log(err);
            }
            console.log('删除文件成功', name);
          })
        }
        res.send({ msg: '修改当前商品数据成功', code: 1062, res: req.body });
      }).catch(err => {
        res.send({ msg: '修改当前商品数据失败', code: 1063 });
      })
    }

    if (req.body.img) {
      let oldImgName = req.body.oldImgName
      delete req.body.oldImgName
      //获取图片base64 传递过来的base64会把+号变成空格需要重新转换为+号
      let imgBase64 = req.body.img.replace(/ /g, '+')
      let buffer = new Buffer(imgBase64, 'base64')
      let fileName = Math.random().toString().slice(2) + '.' + req.body.imgType
      //使用文件系统平台base64写入服务器
      fs.writeFile(__basename + '/upload/' + fileName, buffer, err => {
        if (err) {//上传失败
          req.send({ msg: '添加商品失败', code: 1051 })
        } else {
          req.body.img = fileName
          delete req.body.imgType //删除图片格式
          updateProduct(oldImgName)
        }
      })
    } else {
      updateProduct()
    }
  }

  //删除当前商品数据
  removeProduct(req, res) {
    api.destroyData('Product', {
      userId: req.userId,
      pid: req.body.pid
    }).then(result => {
      fs.unlink(__basename + '/upload/' + req.body.img, function (err) {
        if (err) {
          console.log(err);
        }
        console.log('删除文件成功', req.body.img);
      })
      res.send({ msg: '删除当前商品数据成功', code: 1064, result })
    }).catch(err => {
      res.send({ msg: '删除当前商品数据失败', code: 1065 })
    })
  }

  //获取商品数据总数
  getProductPage(req, res) {
    let condition = {
      userId: req.userId
    }
    //根据条件添加模糊查询
    if (req.query.name) {
      condition.name = {
        [Op.like]: '%' + req.query.name + '%'
      };
    }
    if (req.query.typeId) {
      condition.typeId = req.query.typeId;
    }
    if (req.query.status) {
      condition.status = req.query.status - 0;
    }

    api.count('Product', condition).then(result => {
      res.send({ msg: '获取商品数据总数成功', code: 1066, result })
    }).catch(err => {
      res.send({ msg: '获取商品数据总数失败', code: 1067 })
    })
  }

  //获取用户信息
  getUserInfo(req, res) {
    api.findData('Business', {
      userId: req.userId,
      isDestroy: 0
    }, ['nickname', 'userImg']).then(result => {
      // 
      res.send({ msg: '查询用户信息成功', code: 1024, result });
    }).catch(err => {

      res.send({ msg: '查询用户信息失败', code: 1025 });
    })
  }

  //修改用户信息
  setUserInfo(req, res) {
    function updateUserInfo(name) {
      req.body.nickname = req.body.name
      delete req.body.name
      api.updateData('Business', req.body, {
        userId: req.userId
      }).then(result => {
        if (name && name != 'default.png') {
          fs.unlink(__basename + '/upload/' + name, function (err) {
            if (err) {
              console.log(err);
            }
            console.log('删除文件成功', name);
          })
        }
        res.send({ msg: '修改个人信息成功', code: 1026, res: req.body });
      }).catch(err => {
        res.send({ msg: '修改个人信息失败', code: 1027 });
      })
    }

    if (req.body.img) {
      let oldImgName = req.body.oldImgName
      delete req.body.oldImgName
      //获取图片base64 传递过来的base64会把+号变成空格需要重新转换为+号
      let imgBase64 = req.body.img.replace(/ /g, '+')
      let buffer = new Buffer(imgBase64, 'base64')
      let fileName = Math.random().toString().slice(2) + '.' + req.body.imgType
      //使用文件系统平台base64写入服务器
      fs.writeFile(__basename + '/upload/' + fileName, buffer, err => {
        if (err) {//上传失败
          req.send({ msg: '添加商品失败', code: 1051 })
        } else {
          req.body.userImg = fileName
          delete req.body.img
          delete req.body.imgType //删除图片格式
          updateUserInfo(oldImgName)
        }
      })
    } else {
      updateUserInfo()
    }
  }
}

//导出
module.exports = new RouterController();