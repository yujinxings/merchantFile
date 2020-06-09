<template>
  <div class="userinfo">
    <div class="userinfo-title">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人信息管理</el-breadcrumb-item>
        <el-breadcrumb-item>个人信息</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <el-form
      :model="ruleForm"
      status-icon
      :rules="rules"
      ref="ruleForm"
      label-width="100px"
      class="pro-form"
    >
      <el-form-item label="用户名称" prop="name">
        <el-input v-model="ruleForm.name" style="max-width: 300px;"></el-input>
      </el-form-item>
      <el-form-item label="用户头像">
        <Upload :imgUrl="ruleForm.img" @file-upload="getImg" @del-upload="delImg" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm('ruleForm')">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import Upload from "../components/Upload";
export default {
  inject: ["reload"],
  data() {
    var checkName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("用户名称不能为空"));
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
    return {
      ruleForm: {
        name: "",
        img: "",
        imgType: ""
      },
      oldruleForm: {},
      rules: {
        name: [{ validator: checkName, trigger: "blur" }]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (this.ruleForm.img == "") {
            this.$message.error("请上传头像");
            return;
          }
          let num = 0;
          let data = {};
          for (var key in this.oldruleForm) {
            if (this.oldruleForm[key] == this.ruleForm[key]) {
              num = num + 1;
            } else {
              data[key] = this.ruleForm[key];
            }
          }
          if (num >= 2) {
            this.$message({
              message: "未修改信息",
              type: "success"
            });
            return;
          }
          if (data.img) {
            data.imgType = this.ruleForm.imgType;
            data.oldImgName = this.oldruleForm.img;
          }
          this.axios
            .post("/setUserInfo", {
              data
            })
            .then(res => {
              if (res.data.code == 1026) {
                this.$message({
                  message: "保存成功",
                  type: "success"
                });
                this.reload();
              }
            })
            .catch(err => {
              console.log(err);
            });
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
    }
  },
  components: {
    Upload
  },
  mounted() {
    this.axios
      .get("/getUserInfo")
      .then(res => {
        if (res.data.code == 1024) {
          this.oldruleForm.name = res.data.result[0].nickname;
          this.oldruleForm.img = res.data.result[0].userImg;
          this.ruleForm.name = res.data.result[0].nickname;
          this.ruleForm.img = res.data.result[0].userImg;
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
};
</script>

<style lang="less" scoped>
.userinfo-title {
  height: 40px;
  display: flex;
  align-items: center;
  padding-left: 20px;
  margin-bottom: 20px;
}
</style>