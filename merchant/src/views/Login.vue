<template>
  <div class="register">
    <div class="register-title">商家后台管理系统</div>
    <div class="register-content">
      <div class="content-box">
        <div class="content-title">用户登录</div>
        <el-form
          :model="ruleForm"
          status-icon
          :rules="rules"
          ref="ruleForm"
          label-width="0px"
          class="demo-ruleForm"
        >
          <el-form-item prop="email">
            <el-input v-model="ruleForm.email" placeholder="请输入邮箱"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              v-model.number="ruleForm.password"
              placeholder="请输入密码"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
          </el-form-item>
          <div class="red-login" @click="navRegister">没有账号？去注册</div>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    var formatEmail = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("邮箱不能为空"));
      }
      setTimeout(() => {
        let reg = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (!reg.test(value)) {
          callback(new Error("邮箱格式不正确"));
        } else {
          callback();
        }
      }, 1000);
    };
    var formatPassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("密码不能为空"));
      } else {
        let reg = /^[A-Za-z0-9]\w{5,16}$/;
        if (value.toString().length < 5) {
          callback(new Error("昵称不能小于5个字符"));
        }
        if (value.toString().length > 10) {
          callback(new Error("密码不能大于16个字符"));
        }
        if (!reg.test(value)) {
          callback(new Error("密码只支持字母、数字、_组合,首字母不能为下划线"));
        }
        callback();
      }
    };

    return {
      ruleForm: {
        email: "",
        password: ""
      },
      rules: {
        email: [{ validator: formatEmail, trigger: "blur" }],
        password: [{ validator: formatPassword, trigger: "blur" }]
      }
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.axios
            .post("/login", {
              data: {
                email: this.ruleForm.email,
                password: this.ruleForm.password
              }
            })
            .then(res => {
              console.log(res);
              if (res.data.code == 1020) {
                this.$message({
                  message: "登录成功",
                  type: "success"
                });
                this.$cookies.set("_abc", res.data.token, "5d");
                
                this.$router.push({ name: "Main" });
              } else {
                this.$message.error("邮箱或者密码不正确");
              }
            })
            .catch(err => {
              console.log(err);
            });
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    },
    navRegister() {
      this.$router.push({ name: "Register" });
    }
  }
};
</script>

<style lang="less" scoped>
.register {
  min-width: 1170px;
  margin: 0 auto;
}
.register-title {
  text-align: center;
  font-size: 20px;
  height: 40px;
  line-height: 40px;
  background-color: #ccc;
}
.register-content {
  background: url("../assets/images/bg.jpg") no-repeat center center;
  background-size: cover;
  min-width: 1170px;
  height: calc(100vh - 40px);
  .content-box {
    position: fixed;
    right: 15vw;
    top: 15vh;
    width: 300px;
    height: 280px;
    background-color: #fff;
    padding: 20px;
    border-radius: 6px;
  }
  .content-title {
    font-size: 18px;
    padding-bottom: 20px;
  }
  .content-code {
    display: flex;
    align-items: center;
    .el-input {
      width: 190px;
    }
    .el-button {
      display: inline-block;
      width: 100px;
      height: 40px;
      padding-left: 10px;
      padding-right: 10px;
      margin-left: 10px;
      font-size: 12px;
    }
  }
  .el-button {
    width: 100%;
  }
  .red-login {
    text-align: right;
    font-size: 14px;
    padding-right: 10px;
    cursor: pointer;
  }
}
</style>