<template>
  <div class="product">
    <div class="product-title">
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item>首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>商品列表</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <div class="product-search">
      <el-input
        placeholder="请搜索输入内容"
        prefix-icon="el-icon-search"
        v-model="valueText"
        @keyup.enter.native="searchProduct"
        clearable
      ></el-input>
      <el-select v-model="valueType" style="margin-left:10px;margin-right:10px" placeholder="商品类型">
        <el-option
          v-for="item in typeList"
          :key="item.typeId"
          :label="item.type"
          :value="item.typeId"
        ></el-option>
        <el-option label="取消选择" value="2"></el-option>
      </el-select>
      <el-select v-model="valueStatus" style="width:120px;margin-right:10px" placeholder="商品状态">
        <el-option label="上架" value="1"></el-option>
        <el-option label="下架" value="0"></el-option>
        <el-option label="取消选择" value="2"></el-option>
      </el-select>
      <el-button type="primary" @click="searchProduct">搜索</el-button>
    </div>
    <div class="product-btn">
      <el-button class="btn1" type="text" @click="operationProduct(1)">添加商品</el-button>
      <el-button class="btn2" type="primary" @click="getProductAll">查看全部商品</el-button>
      <el-button class="btn2" type="primary" @click="productPutaway">全部上架</el-button>
      <el-button class="btn2" type="danger" @click="productSoldOut">紧急下架</el-button>
    </div>
    <div class="product-content">
      <el-table
        :data="tableData"
        border
        size="small"
        :empty-text="nullDate"
        style="width:90%;overflow: hidden;"
      >
        <el-table-column type="index" label="序号" align="center"></el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="200px"></el-table-column>
        <el-table-column prop="type" label="商品类型" min-width="80px"></el-table-column>
        <el-table-column
          prop="status"
          label="状态"
          align="center"
          :formatter="formatterIsEnable"
          width="60px"
        ></el-table-column>
        <el-table-column
          prop="created_at"
          label="添加时间"
          :formatter="formatterCreatedAt"
          min-width="140px"
        ></el-table-column>
        <el-table-column
          prop="updated_at"
          label="更新时间"
          :formatter="formatterUpdatedAt"
          min-width="140px"
        ></el-table-column>
        <el-table-column prop="address" label="操作" min-width="240px">
          <template slot-scope="scope">
            <el-button size="mini" @click="operationProduct(0, scope.row.pid)">查看</el-button>
            <el-button size="mini" @click="operationProduct(2, scope.row.pid)">编辑</el-button>
            <el-button
              size="mini"
              :type="scope.row.status?'info':''"
              @click="setProductStatus(scope.$index, scope.row)"
            >{{scope.row.status?'下架':'上架'}}</el-button>
            <el-button size="mini" type="danger" @click="delProduct(scope.$index, scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="product-page">
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
      tableData: [], //商品表格数据
      typeList: [], //商品类型
      valueText: "", //搜索条件 商品名称
      valueType: "", //搜索条件 商品类型
      valueStatus: "", //搜索条件 商品状态
      page: {
        currentPage: 1, //当前页数
        pageCount: 8, //每页显示n条数据
        totalPage: 1 //总页数
      },
      isSearch: false, //当前显示的是否是搜索的商品类型
      nullDate:'' //没有商品时的提示文本
    };
  },
  watch: {
    isSearch(val) {
      if (val) {
        this.nullDate = "未搜索到该商品";
      } else {
        this.nullDate = "还没有添加商品，快去添加吧";
      }
    }
  },
  methods: {
    //格式化商品类型状态
    formatterIsEnable(row) {
      if (row.status) {
        return "上架";
      } else {
        return "下架";
      }
    },
    //格式化商品类型添加时间
    formatterCreatedAt(row) {
      return tool.formatDate(new Date(row.created_at), "yyyy-MM-dd hh:mm:ss");
    },
    //格式化商品类型修改时间
    formatterUpdatedAt(row) {
      return tool.formatDate(new Date(row.updated_at), "yyyy-MM-dd hh:mm:ss");
    },
    //添加商品类型
    operationProduct(id, pid) {
      //0 查看商品 1添加商品 2修改商品
      let params = { id };
      if (pid) {
        params.pid = pid;
      }
      this.$router.push({ name: "Pro", params });
    },
    //获取商品列表
    getProductList() {
      this.isSearch = false;
      this.axios
        .get("/getProduct", {
          params: {
            offset: (this.page.currentPage - 1) * this.page.pageCount,
            limit: this.page.pageCount
          }
        })
        .then(res => {
          console.log(res);
          this.tableData = res.data.result;
        });
    },
    //修改商品类型状态
    setProductStatus(index, row) {
      this.axios
        .post("setStatus", {
          data: {
            status: row.status == 0 ? 1 : 0,
            pid: row.pid
          }
        })
        .then(res => {
          if (res.data.code == 1054) {
            this.$message({
              message: row.status == 0 ? "上架成功" : "下架成功",
              type: "success"
            });
            this.tableData[index].status = row.status == 0 ? 1 : 0;
          } else {
            this.$message.error("操作失败,请重新尝试");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //下架所有商品
    productSoldOut() {
      this.axios
        .post("/setAllStatus", {
          data: {
            status: 0
          }
        })
        .then(res => {
          if (res.data.code == 1056) {
            this.$message({
              message: "全部商品下架成功",
              type: "success"
            });
            this.tableData = this.tableData.map(item => {
              return {
                ...item,
                status: 0
              };
            });
          } else {
            this.$message.error("操作失败,请重新尝试");
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //上架所有商品
    productPutaway() {
      this.axios
        .post("/setAllStatus", {
          data: {
            status: 1
          }
        })
        .then(res => {
          if (res.data.code == 1056) {
            this.$message({
              message: "全部商品上架成功",
              type: "success"
            });
            this.tableData = this.tableData.map(item => {
              return {
                ...item,
                status: 1
              };
            });
          } else {
            this.$message.error("操作失败,请重新尝试");
          }
        })
        .catch(err => {
          console.log(err);
        });
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
    },
    //获取商品类型总页数
    getProductPage() {
      this.axios
        .get("/getProductPage")
        .then(res => {
          console.log(res);

          if (res.data.code == 1066) {
            this.page.totalPage = Math.ceil(
              res.data.result / this.page.pageCount
            );
          }
        })
        .catch(err => {
          console.log(err);
        });
    },
    //查看全部商品
    getProductAll() {
      this.page.currentPage = 1;
      this.getProductPage();
      this.getProductList();
    },
    //获取搜索商品类型总页数
    getSearchProductPage() {
      let params = {};

      if (this.valueText != "") {
        params.name = this.valueText;
      }
      if (this.valueType != 2 && this.valueType != "") {
        params.typeId = this.valueType;
      }
      if (this.valueStatus != 2 && this.valueStatus != "") {
        params.status = this.valueStatus;
      }
      this.axios
        .get("/getProductPage", {
          params
        })
        .then(res => {
          if (res.data.code == 1066) {
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
    searchProduct(bool = true) {
      this.isSearch = true;
      //bool是否显示搜索结果第一页
      if (bool) {
        this.page.currentPage = 1;
      }
      this.getSearchProductPage();
      let params = {
        offset: (this.page.currentPage - 1) * this.page.pageCount,
        limit: this.page.pageCount
      };
      if (this.valueText != "") {
        params.name = this.valueText;
      }
      if (this.valueType != 2 && this.valueType != "") {
        params.typeId = this.valueType;
      }
      if (this.valueStatus != 2 && this.valueStatus != "") {
        params.status = this.valueStatus;
      }
      if (Object.keys(params).length <= 2) {
        this.$message.error("请至少选择一个条件进行搜索");
        return;
      }
      this.axios
        .get("/getProduct", {
          params
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
        this.searchProduct(false);
        return;
      }
      this.getProductList();
    },
    //下一页
    nextPage() {
      this.page.currentPage = this.page.currentPage + 1;
      if (this.isSearch) {
        this.searchProduct(false);
        return;
      }
      this.getProductList();
    },
    //当前点击页
    currPage(val) {
      this.page.currentPage = val;
      if (this.isSearch) {
        this.searchProduct(false);
        return;
      }
      this.getProductList();
    },
    //删除商品
    delProduct(index, row) {
      this.$confirm("是否删除该商品", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.axios
            .post("/removeProduct", {
              data: {
                pid: row.pid,
                img:row.img
              }
            })
            .then(res => {
              if (res.data.code == 1064) {
                this.$message({
                  type: "success",
                  message: "删除成功!"
                });
                //判断删除的数据是否是当前页最后一条数据
                if (this.tableData.length == 1) {
                  this.page.currentPage = this.page.currentPage - 1;
                  this.page.totalPage = this.page.totalPage - 1;
                  if (this.isSearch) {
                    this.searchProduct(false);
                    return;
                  }
                  this.getProductPage()
                  this.getProductList();
                  
                  return;
                }
                if (this.isSearch) {
                  this.searchProduct(false);
                  return;
                }
                this.getProductPage()
                this.getProductList();
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
    this.getProductPage();
    this.getProductList();
  }
};
</script>

<style lang="less" scoped>
.product{
  height: 100%;
  overflow-y: auto;
}
.product-title {
  height: 40px;
  display: flex;
  align-items: center;
  padding-left: 20px;
}
.product-search {
  display: flex;
  align-items: center;
  .el-input {
    flex: 0 0 400px;
    margin-left: 40px;
  }
}
.product-btn {
  padding-left: 40px;
  margin-top: 20px;
  .btn1 {
    background-color: #67c23a;
    color: #fff;
    padding: 12px 20px;
  }
}
.product-content {
  padding-left: 40px;
  margin-top: 20px;
  .el-button--mini,
  .el-button--mini.is-round {
    padding: 7px 10px;
  }
}
.product-page {
  padding-left: 40px;
  margin-top: 20px;
  padding-bottom: 40px;
}
</style>