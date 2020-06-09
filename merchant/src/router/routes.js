export const routes = [

  {
    path: '/register',
    name: 'Register',
    component: () => import(/* webpackChunkName: "about" */ '../views/Register.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import(/* webpackChunkName: "about" */ '../views/Login.vue')
  },
  {
    path: '/main',
    name: 'Main',
    component: () => import(/* webpackChunkName: "about" */ '../views/Main.vue'),
    redirect: {
      name: 'Type'
    },
    children:[
      {
        path: 'type',
        name: 'Type',
        component: () => import(/* webpackChunkName: "about" */ '../views/Type.vue')
      },
      {
        path: 'product',
        name: 'Product',
        component: () => import(/* webpackChunkName: "about" */ '../views/Product.vue')
      },
      {
        path: 'pro/:id/:pid?',
        name: 'Pro',
        component: () => import(/* webpackChunkName: "about" */ '../views/Pro.vue')
      },
      {
        path: 'userInfo',
        name: 'UserInfo',
        component: () => import(/* webpackChunkName: "about" */ '../views/UserInfo.vue')
      }
    ]
  },
  {
    path: '*',
    redirect: {
      name: 'Login'
    }
  }
]