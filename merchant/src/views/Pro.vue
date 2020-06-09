<template>
  <div class="pro">
    <div class="type-title">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item style="cursor: pointer;" :to="{name:'Product'}" replace>商品列表</el-breadcrumb-item>
        <el-breadcrumb-item v-if="proUrl==0">商品查看</el-breadcrumb-item>
        <el-breadcrumb-item v-if="proUrl==1">商品添加</el-breadcrumb-item>
        <el-breadcrumb-item v-if="proUrl==2">商品编辑</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-form
      :model="ruleForm"
      status-icon
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="pro-form"
      :disabled="proUrl==0"
    >
      <el-form-item label="商品名称" prop="name">
        <el-input v-model="ruleForm.name" style="max-width: 300px;"></el-input>
      </el-form-item>
      <el-form-item label="商品类型" prop="typeId">
        <el-select v-model="ruleForm.typeId" placeholder="请选择商品类型">
          <el-option
            v-for="item in typeList"
            :key="item.typeId"
            :label="item.type"
            :value="item.typeId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="商品初始价格" prop="price">
        <el-input v-model="ruleForm.price" style="max-width:100px;"></el-input>
      </el-form-item>
      <el-form-item label="商品图片">
        <Upload
          :imgUrl="ruleForm.img"
          :routerUrl="proUrl == 0 ? 0 : 1"
          @file-upload="getImg"
          @del-upload="delImg"
        />
      </el-form-item>

      <el-form-item label="商品状态" prop="status">
        <el-radio-group v-model="ruleForm.status">
          <el-radio :label="1">上架</el-radio>
          <el-radio :label="0">下架</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button v-if="proUrl==1" type="primary" @click="submitForm('ruleForm')">添加商品</el-button>
        <el-button v-if="proUrl==2" type="primary" @click="submitForm('ruleForm')">修改商品</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Upload from "../components/Upload";
export default {
  data() {
    var checkName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("商品名称不能为空"));
      }
      setTimeout(() => {
        let nameReg = /<\/?script>/;
        if (nameReg.test(value)) {
          callback(new Error("包涵非法字段"));
        } else {
          callback();
        }
      }, 300);
    };
    var checkPrice = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("商品价格不能为空"));
      }
      setTimeout(() => {
        let priceReg = /^(([1-9]\d*)|0)(\.\d{1,2})?$/;
        if (!priceReg.test(value)) {
          callback(new Error("请输入正确的数字格式且最多两位小数"));
        } else {
          callback();
        }
      }, 300);
    };
    return {
      proUrl: 1,
      typeList: null,
      ruleForm: {
        name: "",
        typeId: "",
        price: "",
        status: 1,
        img: "",
        imgType: ""
      },
      rules: {
        name: [{ validator: checkName, trigger: "blur" }],
        price: [{ validator: checkPrice, trigger: "blur" }]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.ruleForm.typeId == "") {
            this.$message.error("请选择商品类型");
            return;
          }
          if (this.ruleForm.img == "") {
            this.$message.error("请上传商品图片");
            return;
          }
          if (this.proUrl == 1) {
            this.axios
              .post("/addProduct", {
                data: this.ruleForm
              })
              .then(res => {
                if (res.data.code == 1050) {
                  this.$message({
                    message: "添加商品成功",
                    type: "success"
                  });
                }
                this.$router.back();
              })
              .catch(() => {
                this.$message.error("添加失败请重新尝试");
              });
          }
          if (this.proUrl == 2) {
            let data = {};
            let objLength = Object.keys(this.oldRuleForm).length;
            let num = 0;
            //判断是否有修改过数据
            for (var key in this.oldRuleForm) {
              if (this.oldRuleForm[key] == this.ruleForm[key]) {
                num = num + 1;
              } else {
                data[key] = this.ruleForm[key];
              }
            }
            if (num == objLength) {
              this.$message({
                message: "该商品未改动",
                type: "success"
              });
              // this.$router.back();
              return;
            }
            if (data.img) {
              data.imgType = this.ruleForm.imgType;
              data.oldImgName = this.oldRuleForm.img;
            }
            data.pid = this.$route.params.pid;
            console.log(data);
            this.axios
              .post("/setProduct", {
                data
              })
              .then(res => {
                this.$message({
                  message: "商品修改成功",
                  type: "success"
                });
                this.$router.back()
                console.log(res);
              })
              .catch(err => {
                this.$message.error("修改失败，请重新尝试");
                console.log(err);
              });
          }
          //保存到数据库
        } else {
          return false;
        }
      });
    },
    getImg(file) {
      let imgReg = /data:image\/[A-Za-z]+;base64,/;
      this.ruleForm.img = file.imgBase64.replace(imgReg, "");
      this.ruleForm.imgType = file.imgType;
    },
    delImg() {
      this.ruleForm.img = "";
    },
    //获取商品类型
    getType() {
      this.axios
        .get("/getProType")
        .then(res => {
          this.typeList = res.data.result;
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  mounted() {
    this.proUrl = this.$route.params.id;
    let pid = this.$route.params.pid;
    if (this.proUrl != 1 && pid) {
      //根据商品id获取商品数据
      this.axios
        .get("/getCurrProduct", {
          params: {
            pid
          }
        })
        .then(res => {
          console.log(res);

          if (res.data.code == 1060) {
            let data = res.data.result[0];
            data.status = data.status - 0;
            this.oldRuleForm = data; //临时数据储存 用于判断数据是否改变
            for (var item in this.oldRuleForm) {
              this.ruleForm[item] = this.oldRuleForm[item];
            }
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    this.getType();
  },

  components: {
    Upload
  }
};
</script>

<style lang="less" scoped>
.img {
  display: inline-block;
  width: 200px;
  height: 200px;
}
.pro {
  height: 100vh;
  overflow-y: auto;
  .type-title {
    height: 40px;
    display: flex;
    align-items: center;
    padding-left: 20px;
  }
  .pro-form {
    padding: 20px 0 50px 20px;
  }
}
</style>