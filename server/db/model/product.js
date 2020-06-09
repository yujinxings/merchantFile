//商家商品类型模型(数据表结构)
const Sequelize = require('sequelize');

let Model = Sequelize.Model;

//Type模型继承Model
class Product extends Model {

}

//创建type数据表结构
Product.init({
  id: {
    type: Sequelize.INTEGER.UNSIGNED, //数据类型, INTEGER: 整型, UNSIGNED: 无符号
    allowNull: false, //是否允许为null
    primaryKey: true, //主键
    autoIncrement: true, //自动递增
    comment: '表id' //备注
  },

  pid: {
    type: Sequelize.STRING(30),
    allowNull: false,
    defaultValue: '',
    comment: '商品id'
  },
  userId: {
    type: Sequelize.STRING(30),
    allowNull: false,
    defaultValue: '',
    comment: '商家id'
  },
  typeId: {
    type: Sequelize.STRING(30),
    allowNull: false,
    defaultValue: '',
    comment: '商品类型id'
  },
  name: {
    type: Sequelize.STRING(50),
    allowNull: false,
    defaultValue: '',
    comment: '商品名称'
  },
  price: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    comment: '商品价格'
  },
  img: {
  	type: Sequelize.STRING(30),
    allowNull: false,
    defaultValue: '',
    comment: '商品图片'
  },
  status: {
    type: Sequelize.BOOLEAN,
    allowNull: false,
    defaultValue: 1,
    comment: '1：上架，0：下架'
  },
}, {
  //配置
  // 默认为类的名称，即在这种情况下为`Type`。 这将控制自动生成的`foreignKey`（外键）的名称和关联命名
  modelName: 'product',

  //是否添加时间戳属性 (updatedAt, createdAt)
  timestamps: true,

  //是否开启假删除
  //不实际删除数据库记录，而是设置一个新 deletedAt 属性，其值为当前日期
  paranoid: false,

  //自动设置字段为蛇型（以_方式命名）命名规则
  underscored: true,

  //是否禁止修改表名
  //默认情况下，sequelize 会自动将所有传递的模型名称转换为复数形式。
  freezeTableName: true,

  //定义表名
  tableName: 'product',

  //连接实例
  sequelize

})

//force: true, 如果存在该表，则先删除该表，再创建新表，否则直接创建新表
//force: false, 如果存在该表，则不创建新表，否则创建新表
Product.sync({ force: false });

//导出模型
module.exports = Product;