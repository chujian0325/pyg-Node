// 组织所有的路由
const express = require('express')
const router = express.Router()
const homeController = require('./controllers/home')
const listController = require('./controllers/list')
const itemController = require('./controllers/item')
const cartController = require('./controllers/cart')
const usersController = require('./controllers/users')
const orderController = require('./controllers/order')
const payController = require('./controllers/pay')

const middlewares = require('./middlewares')



// 添加若干个路由方法

// 首页路由
router.get('/', homeController.index)
router.get('/like', homeController.like)

// 列表页路由
// restful 路由规则，根据id查询数据
router.get('/list/:id', listController.index)
router.get('/search', listController.search)

// 详情
router.get('/item/:id', itemController.index)


// 购物车相关路由
router.get('/cart/add', cartController.addCart)
router.get('/cart/addCartSuccess', cartController.addCartSuccess)
router.get('/cart', cartController.index)
router.get('/cart/list', cartController.list)
router.post('/cart/edit', cartController.edit)
router.post('/cart/remove', cartController.remove)

// 登录相关路由
router.get('/login', usersController.login)
router.get('/logout', usersController.logout)
router.post('/login', usersController.loginLogic)


// 订单相关
router.get('/checkout', middlewares.checkLogin, orderController.checkout) //结算页面,这也是加中间件的方法，执行顺序是按写的顺序执行
router.get('/order/add', middlewares.checkLogin, orderController.addOrder) //生成订单,这也是加中间件的方法，执行顺序是按写的顺序执行
router.get('/order', middlewares.checkLogin, orderController.list) //全部订单



// 支付相关的路由
router.get('/pay', middlewares.checkLogin, payController.pay)
router.get('/pay/callback', middlewares.checkLogin, payController.callback)



// 更多的业务路由

module.exports = router