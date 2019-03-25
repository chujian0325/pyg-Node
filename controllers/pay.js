const orderModel = require('../models/order')
const alipay = require('../utils/alipay')
exports.pay = (req, res, next) => {
    // 进行支付
    // 获取订单信息 需要订单编号 ，点击立即支付的时候传递订单编号
    const num = req.query.num
    // 根据订单编号获取订单信息
    orderModel.item(num)
        .then(order => {
            // 获取支付地址
            const url = alipay.getPayUrl(order)
            // 跳转支付宝
            res.redirect(url)
        }).catch(err => next(err))
}


exports.callback = (req, res, next) => {
    // 订单之前的状态是未付款，如果能成功的回跳过来，需要把状态改成已付款，再把订单信息展示出来
    // 修改订单的状态
    // 修改订单 接口  PATCH orders/:num
    // 获取订单编号 req.query.out_trade_no
    // 获取支付宝流水 req.query.trade_no
    const out_trade_no = req.query.out_trade_no
    const trade_no = req.query.trade_no
    // 支付状态，1是已支付、
    orderModel.edit(out_trade_no, 1, trade_no)
        .then(order => {
            // 成功提示  订单信息 页面展示
            res.locals.order = order
            res.render('paySuccess.art')
        }).catch(err => next(err))
}