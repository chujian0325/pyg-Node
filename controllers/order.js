// 定义订单相关路由函数
const orderModel = require('../models/order')
// 生成订单
exports.addOrder = (req, res, next) => {
  // 生成订单  需要调接口
  // 需要的数据，传参 用户id,商品id，多个以逗号分隔
  // console.log(req.query.items)
  const items = req.query.items
  // 在models/order.js中调接口
  orderModel.add(req.session.user.id, items)
    .then(order => {
      console.log(order)
      // 打印的order中有订单id和订单编号，我们需要传递一个唯一标识去订单核对页面，根据接口文档，GET orders/:num ，可知，我们在重定向的时候要传一个编号num，来到checkout才能根据订单信息，渲染页面，才能去核对
      res.redirect('/checkout?num=' + order.order_number)
    }).catch(err => next(err))

}

// 核对订单
exports.checkout = (req, res, next) => {
  // // 登录拦截，很多地方都要登录拦截，可以定义一个登录拦截中间件->middlewares.js
  // if (!req.session.user) {
  //     // 如果没有登录，则重定向到登录页面，携带当前的url后面好回跳，url中如果有参数，最好用url编码转码
  //     return res.redirect('/login?returnUrl=' + encodeURIComponent(req.url))
  // }

  // 核对订单(结算页面)
  // 结算页面需要订单信息，因为需要核对订单信息
  orderModel.item(req.query.num)
    .then(order => {
      res.locals.order = order
      res.render('checkout.art')
    }).catch(err => next(err))
}




// 全部订单
exports.list = (req, res, next) => {
  // 获取全部订单数据
  orderModel.alllist(req.session.user.id)
    .then(list => {
      res.locals.list = list
      // 渲染模板
      res.render('order.art')
    }).catch(err => next(err))
}