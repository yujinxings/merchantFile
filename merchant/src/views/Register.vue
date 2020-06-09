<template>
  <div class="register">
    <div class="register-title">商家后台管理系统</div>
    <div class="register-content">
      <div class="content-box">
        <div class="content-title">用户注册</div>
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
          <el-form-item prop="username">
            <el-input v-model="ruleForm.username" placeholder="请输入用户名"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              v-model.number="ruleForm.password"
              placeholder="请输入密码"
              autocomplete="off"
            ></el-input>
          </el-form-item>
          <el-form-item class="content-code" prop="code">
            <el-input v-model.number="ruleForm.code" placeholder="请输入验证码"></el-input>
            <el-button type="primary" :disabled="isSend" @click="getCode()">{{text}}</el-button>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm('ruleForm')">注册</el-button>
          </el-form-item>
          <div class="red-login" @click="navLogin">已有注册？去登录</div>
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
          this.isInputEmail = true;
          callback();
        }
      }, 1000);
    };
    var formatUsername = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("用户名不能为空"));
      } else {
        let reg = /^[\w\u4e00-\u9fa5]{1,10}$/;
        if (value.toString().length > 10) {
          callback(new Error("用户名不能大于10个字符"));
        }
        if (!reg.test(value)) {
          callback(new Error("用户名只支持字母、汉字、数字、_组合"));
        }
        callback();
      }
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
    var formatCode = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("验证码不能为空"));
      } else {
        if (value.toString().length != 6) {
          callback(new Error("验证码必须为6位数字"));
        }
        callback();
      }
    };
    return {
      ruleForm: {
        email: "",
        username: "",
        password: "",
        code: ""
      },
      rules: {
        email: [{ validator: formatEmail, trigger: "blur" }],
        username: [{ validator: formatUsername, trigger: "blur" }],
        password: [{ validator: formatPassword, trigger: "blur" }],
        code: [{ validator: formatCode, trigger: "blur" }]
      },
      text: "获取验证码",
      isSend: false,
      isInputEmail: false
    };
  },
  methods: {
    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.axios
            .post("/register", {
              data: {
                email: this.ruleForm.email,
                nickname: this.ruleForm.username,
                password: this.ruleForm.password,
                code: this.ruleForm.code
              }
            })
            .then(res => {
              if (res.data.code == 1000) {
                this.$message({
                  message: "注册成功",
                  type: "success"
                });
                this.$router.push({ name: "Login" });
              }
              if(res.data.code == 1001){
                 this.$message.error("注册失败,请重新尝试");
              }
              if(res.data.code == 1002){
                 this.$message.error("该邮箱已经被注册");
              }
              if(res.data.code == 1013){
                 this.$message.error("验证码已失效或者不正确");
              }
              console.log(res);
            })
            .catch(err => {

              console.log(err);
            });
        } else {
          return false;
        }
      });
    },
    getCode() {
      if (this.isInputEmail) {
        let time = 1;
        this.text = `${time}s后重新发送`;
        this.isSend = true;
        let timer = setInterval(() => {
          if (time == 0) {
            clearInterval(timer);
            timer = null;
            this.text = `获取验证码`;
            this.isSend = false;
          } else {
            time--;
            this.text = `${time}s后重新发送`;
          }
        }, 1000);
        this.axios
          .post("/sendmail", {
            data: {
              email: this.ruleForm.email
            }
          })
          .then(res => {
            console.log(res);
            if (res.data.code == 1010) {
              this.$message({
                message: "验证码已发送至您的邮箱,请注意查收",
                type: "success"
              });
            }else{
              this.$message.error("验证码发送失败,请重新尝试");
            }
          })
          .catch(err => {
            console.log(err);
          });
      } else {
        this.$message.error("请先输入邮箱");
      }
    },
    navLogin() {
      this.$router.push({ name: "Login" });
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
    height: 370px;
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