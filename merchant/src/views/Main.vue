<template>
  <div class="main">
    <div class="main-heade">
      <div class="heade-title">商家商品管理系统</div>
      <div class="heade-content">
        <div class="heade-img">
          <img :src="staticUrl+'/'+userImg" alt />
        </div>
        <div class="heade-name">你好,{{userName}}</div>
        <div class="heade-btn">
          <el-button size="mini" @click="logout">注销</el-button>
        </div>
      </div>
    </div>
    <div class="main-content">
      <div class="content-left">
        <el-menu
          ref="menu"
          :default-active="currName"
          class="el-menu-vertical-demo"
          background-color="#2c3b58"
          text-color="#fff"
          active-text-color="#ffd04b"
          unique-opened
        >
          <el-submenu index="1">
            <template slot="title">
              <span>商品管理</span>
            </template>
            <el-menu-item index="Type" @click="jumpType">商品类型</el-menu-item>
            <el-menu-item index="Product" @click="jumpProduct">商品列表</el-menu-item>
          </el-submenu>
          <el-submenu index="2">
            <template slot="title">
              <span>个人信息管理</span>
            </template>
            <el-menu-item index="UserInfo" @click="jumpUserInfo">个人信息</el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
      <div class="content-right">
        <!-- 二级路由 -->
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>

<script>
export default {
 
  data() {
    return {
      currName: "",
      userName: "商家",
      userImg: "default.png"
    };
  },
  methods: {
    jumpType() {
      if (this.currName != "Type") {
        this.$router.push({ name: "Type" });
      }
    },
    jumpProduct() {
      if (this.currName != "Product") {
        this.$router.push({ name: "Product" });
      }
    },
    jumpUserInfo() {
      if (this.currName != "UserInfo") {
        this.$router.push({ name: "UserInfo" });
      }
    },
    logout() {
      this.$cookies.remove("_abc");
      this.$router.push({ name: "Login" });
    }
  },
  mounted() {
    this.currName = this.$route.name;
    if (this.currName == "Type" || this.currName == "Product") {
      this.$refs.menu.open(1);
    }
    this.axios
      .get("/getUserInfo")
      .then(res => {
        console.log(res);
        if (res.data.code == 1014) {
          this.$message.error("请先登录");
          setTimeout(() => {
            this.$router.push({ name: "Login" });
          }, 1000);
        }
        if (res.data.code == 1024) {
          this.userName = res.data.result[0].nickname;
          this.userImg = res.data.result[0].userImg;
        }
      })
      .catch(err => {
        console.log(err);
      });
  },
  beforeRouteUpdate(to, from, next) {
    this.currName = to.name;
    next();
  }
};
</script>

<style lang="less" scoped>
.main {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
}

.main-heade {
  height: 50px;
  line-height: 50px;
  width: 100vw;
  background-color: #0099ff;
  align-items: center;
  .heade-title {
    font-size: 20px;
    padding-left: 20px;
    color: #fff;
    float: left;
  }
  .heade-content {
    float: right;
    height: 50px;
    display: flex;
    align-items: center;
    padding-right: 40px;
    .heade-img {
      height: 36px;
      margin-right: 10px;
      img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
      }
    }
    .heade-btn {
      padding-left: 20px;
    }
    .heade-name {
      color: #fff;
      font-size: 16px;
    }
  }
}
.main-content {
  height: calc(~"(100vh - 50px)");
  display: flex;
  .content-left {
    flex: 0 0 200px;
    background-color: #2c3b58;
    .el-menu-vertical-demo {
      height: 100%;
      border: 0;
    }
  }
  .content-right {
    flex: 1;
  }
}
</style>