<template>
  <div class="type">
    <div class="type-title">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品类型</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="type-search">
      <el-input
        placeholder="请输入内容"
        prefix-icon="el-icon-search"
        v-model="searchText"
        @keyup.enter.native="searchType"
      ></el-input>
      <el-button type="primary" @click="searchType">搜索</el-button>
    </div>
    <div class="type-btn">
      <el-button class="btn1" type="text" @click="addType('add','添加')">添加商品类型</el-button>
      <el-button class="btn2" type="primary" @click="getTypeAll">查看全部商品类型</el-button>
    </div>
    <div class="type-content">
      <el-table
        :data="tableData"
        border
        size="small"
        :empty-text="nullDate"
        style="width:90%;overflow: hidden;"
      >
        <el-table-column type="index" label="序号" align="center"></el-table-column>
        <el-table-column prop="type" label="商品类型" min-width="80px"></el-table-column>
        <el-table-column
          prop="isEnable"
          label="状态"
          align="center"
          :formatter="formatterIsEnable"
          width="60px"
        ></el-table-column>
        <el-table-column
          prop="createdAt"
          label="添加时间"
          :formatter="formatterCreatedAt"
          min-width="140px"
        ></el-table-column>
        <el-table-column
          prop="updatedAt"
          label="更新时间"
          :formatter="formatterUpdatedAt"
          min-width="140px"
        ></el-table-column>
        <el-table-column prop="address" label="操作" min-width="180px">
          <template slot-scope="scope">
            <el-button size="mini" @click="addType('update','修改',scope.$index, scope.row)">编辑</el-button>
            <el-button
              size="mini"
              :type="scope.row.isEnable?'info':''"
              @click="setTypeIsEnable(scope.$index, scope.row)"
            >{{scope.row.isEnable?'禁用':'启用'}}</el-button>
            <el-button size="mini" type="danger" @click="delType(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="type-page">
      <el-pagination
        layout="prev, pager, next"
        :total="page.totalPage*10"
        :current-page="page.currentPage"
        @current-change="currPage"
        @prev-click="prevPage"
        @next-click="nextPage"
      ></el-pagination>
    </div>
  </div>
</template>

<script>
import { tool } from "../assets/js/tool";
export default {
  data() {
    return {
      searchText: "", //搜索内容
      tableData: [], //商品类型数据
      page: {
        currentPage: 1, //当前页数
        pageCount: 8, //每页显示n条数据
        totalPage: 1 //总页数
      },
      isSearch: false, //当前显示的是否是搜索的商品类型
      nullDate: "" //没有数据时的提示
    };
  },
  watch: {
    isSearch(val) {
      if (val) {
        this.nullDate = "未搜索到该商品类型";
      } else {
        this.nullDate = "还没有添加商品类型，快去添加吧";
      }
    }
  },
  methods: {
    //格式化商品类型状态
    formatterIsEnable(row) {
      if (row.isEnable) {
        return "启用";
      } else {
        return "禁用";
      }
    },
    //格式化商品类型添加时间
    formatterCreatedAt(row) {
      return tool.formatDate(new Date(row.createdAt), "yyyy-MM-dd hh:mm:ss");
    },
    //格式化商品类型修改时间
    formatterUpdatedAt(row) {
      return tool.formatDate(new Date(row.updatedAt), "yyyy-MM-dd hh:mm:ss");
    },
    //添加/修改商品类型
    addType(model, title, index, row) {
      this.$prompt("请输入商品类型", `${title}商品类型`, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /^[\w\u4e00-\u9fa5]{1,20}$/,
        inputErrorMessage: "商品类型不能为空",
        inputValue: row ? row.type : null
      })
        .then(res => {
          if (model == "add") {
            this.axios
              .post("/addType", {
                data: {
                  type: res.value
                }
              })
              .then(result => {
                console.log(result);
                if (result.data.code == 1036) {
                  this.$message({
                    type: "success",
                    message: "添加成功"
                  });
                  this.getTypePage();
                  this.page.currentPage = 1;
                  this.getType();
                } else {
                  this.$message.error("操作失败,请重新尝试");
                }
              })
              .catch(err => {
                console.log(err);
              });
          } else if (model == "update") {
            if (res.value == row.type) {
              this.$message({
                type: "success",
                message: "当前商品类型未改动"
              });
            } else {
              this.axios
                .post("/setType", {
                  data: {
                    type: res.value,
                    typeId: row.typeId
                  }
                })
                .then(result => {
                  if (result.data.code == 1034) {
                    this.$message({
                      type: "success",
                      message: "修改成功"
                    });
                    this.tableData[index].type = res.value;
                  } else {
                    this.$message.error("操作失败,请重新尝试");
                  }
                })
                .catch(err => {
                  console.log(err);
                });
            }
          }
        })
        .catch(() => {});
    },
    //获取商品类型
    getType() {
      this.isSearch = false;
      this.axios
        .get("/getType", {
          params: {
            offset: (this.page.currentPage - 1) * this.page.pageCount,
            limit: this.page.pageCount
          }
        })
        .then(res => {
          this.tableData = res.data.result;
        });
    },
    //修改商品类型状态
    setTypeIsEnable(index, row) {
      this.axios
        .post("setTypeIsEnable", {
          data: {
            isEnable: !row.isEnable ? 1 : 0,
            typeId: row.typeId
          }
        })
        .then(res => {
          if (res.data.code == 1032) {
            this.$message({
              message: row.isEnable ? "禁用成功" : "启用成功",
              type: "success"
            });
            this.tableData[index].isEnable = !row.isEnable;
          } else {
            this.$message.error("操作失败,请重新尝试");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //获取商品类型总页数
    getTypePage() {
      this.axios
        .get("/getTypePage")
        .then(res => {
          if (res.data.code == 1038) {
            this.page.totalPage = Math.ceil(
              res.data.result / this.page.pageCount
            );
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //查看全部商品类型
    getTypeAll() {
      this.page.currentPage = 1;
      this.getTypePage();
      this.getType();
    },
    //获取搜索商品类型总页数
    getSearchTypePage() {
      this.axios
        .get("/getSearchTypePage", {
          params: {
            type: this.searchText
          }
        })
        .then(res => {
          if (res.data.code == 1042) {
            this.page.totalPage = Math.ceil(
              res.data.result / this.page.pageCount
            );
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //搜索商品类型
    searchType(bool = true) {
      this.isSearch = true;
      //bool是否显示搜索结果第一页
      if (bool) {
        this.page.currentPage = 1;
      }
      this.getSearchTypePage();
      this.axios
        .get("/searchType", {
          params: {
            type: this.searchText,
            offset: (this.page.currentPage - 1) * this.page.pageCount,
            limit: this.page.pageCount
          }
        })
        .then(res => {
          console.log(res);
          this.tableData = res.data.result;
        })
        .catch(err => {
          console.log(err);
        });
    },
    //上一页
    prevPage() {
      this.page.currentPage = this.page.currentPage - 1;
      if (this.isSearch) {
        this.searchType(false);
        return;
      }
      this.getType();
    },
    //下一页
    nextPage() {
      this.page.currentPage = this.page.currentPage + 1;
      if (this.isSearch) {
        this.searchType(false);
        return;
      }
      this.getType();
    },
    //当前点击页
    currPage(val) {
      this.page.currentPage = val;
      if (this.isSearch) {
        this.searchType(false);
        return;
      }
      this.getType();
    },

    //删除商品类型
    delType(index, row) {
      this.$confirm("是否删除该商品类型", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.axios
            .post("/removeType", {
              data: {
                typeId: row.typeId
              }
            })
            .then(res => {
              if (res.data.code == 1044) {
                this.$message({
                  type: "success",
                  message: "删除成功!"
                });
                //判断删除的数据是否是当前页最后一条数据
                if (this.tableData.length == 1) {
                  this.page.currentPage = this.page.currentPage - 1;
                  this.page.totalPage = this.page.totalPage - 1;
                  if (this.isSearch) {
                    this.searchType(false);
                    return;
                  }
                  this.getTypePage();
                  this.getType();
                  return;
                }
                if (this.isSearch) {
                  this.searchType(false);
                  return;
                }
                this.getTypePage();
                this.getType();
              } else {
                this.$message.error("操作失败,请重新尝试");
              }
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(() => {});
    }
  },
  mounted() {
    this.getType();
    this.getTypePage();
  }
};
</script>

<style lang="less" scoped>
.type {
  height: 100%;
  overflow-y: auto;
}
.type-title {
  height: 40px;
  display: flex;
  align-items: center;
  padding-left: 20px;
}
.type-search {
  display: flex;
  align-items: center;
  .el-input {
    flex: 0 0 400px;
    margin-left: 40px;
  }
}
.type-btn {
  padding-left: 40px;
  margin-top: 20px;
  .btn1 {
    background-color: #67c23a;
    color: #fff;
    padding: 12px 20px;
  }
}
.type-content {
  padding-left: 40px;
  margin-top: 20px;
  .el-button--mini,
  .el-button--mini.is-round {
    padding: 7px 10px;
  }
}
.type-page {
  padding-left: 40px;
  margin-top: 20px;
  padding-bottom: 40px;
}
</style>