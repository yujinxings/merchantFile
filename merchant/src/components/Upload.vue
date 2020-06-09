<template>
  <div class="upload">
    <label for="file-img" class="file-box">
      <div class="el-icon-plus"></div>
    </label>
    <input type="file" id="file-img" class="file" @change="getFileData" />
    <div class="del-box" v-if="url||imgUrl">
      <img :src="url ? url : `${staticUrl}/${imgUrl}`" />
      
      <div class="del-img" v-if="routerUrl==1">
        <div class="el-icon-delete" @click="removeImg"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  //传递数据 size:图片上传最大大小
  props: {
    size: {
      tpye: Number,
      default: 1 //1mb
    },
    routerUrl: {
      type: Number,
      default: 1 //1：可以修改图片  0：不可以修改图片
    },
    imgUrl: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      url: ""
    };
  },
  methods: {
    //获取添加的图片
    getFileData(e) {
      let _this = this;
      let file = e.target.files[0];
      console.log();

      //把图片大小转mb
      let fileSize = file.size / 1024 / 1024;
      if (fileSize > this.size) {
        this.$message.error(`图片上传不能超过${this.size}mb`);
        return;
      }
      //创建文件读取对象
      let fileReader = new FileReader();
      //监听文件是否读取完毕
      fileReader.onload = function() {
        _this.url = this.result;
        _this.$emit("file-upload", {
          imgBase64: this.result,
          imgType: file.type.split("/")[1]
        });
      };
      //读取对象
      fileReader.readAsDataURL(file);
    },
    //清除图片
    removeImg() {
      this.url = "";
      this.$emit("del-upload");
    }
  }
};
</script>

<style lang="less" scoped>
.upload {
  position: relative;
  width: 150px;
  height: 150px;
  border: 1px dashed #ddd;
  background-color: #fbfdff;
  border-radius: 10px;
  overflow: hidden;

  .file-box {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 100%;
    .el-icon-plus {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      font-size: 40px;
      color: #eee;
    }
  }
  .del-box {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    img {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
    }
    .del-img {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      font-size: 25px;
      color: #fff;
      transition: all 0.4s linear;
      .el-icon-delete {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        opacity: 0;
        visibility: hidden;
        transition: all 0.4s linear;
        cursor: pointer;
      }
    }
    .del-img:hover {
      background-color: rgba(0, 0, 0, 0.5);
      .el-icon-delete {
        visibility: visible;
        opacity: 1;
      }
    }
  }
  .file {
    display: none;
  }
}
</style>