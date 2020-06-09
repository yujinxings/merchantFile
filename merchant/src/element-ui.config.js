import {
  Button,
  Message, MessageBox,
  Input, Form, FormItem, Radio, RadioGroup, Select, Option,
  Menu, Submenu, MenuItem, MenuItemGroup,
  Breadcrumb, BreadcrumbItem,
  Table, TableColumn,
  Pagination

} from 'element-ui';

let arr = [
  Button,
  Input, Form, FormItem, Radio, RadioGroup, Select, Option,
  Menu, Submenu, MenuItem, MenuItemGroup,
  Breadcrumb, BreadcrumbItem,
  Table, TableColumn,
  Pagination
]
export default function (Vue) {
  arr.forEach(Component => {
    return Vue.use(Component)
  })

  Vue.prototype.$message = Message
  Vue.prototype.$prompt = MessageBox.prompt;
  Vue.prototype.$confirm = MessageBox.confirm;
}