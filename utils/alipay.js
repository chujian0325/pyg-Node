// 获取支付地址=支付宝网关+加密后的参数，以问号拼接
// 支付宝网关+'?'+加密后的参数
const path = require('path')
/**1.使用第三方包 alipay-node-sdk */
const Alipay = require('alipay-node-sdk')
/**2. 得到构造函数，实例化后，去对参数进行加密*/
const alipay = new Alipay({
    // appId 应用ID
    appId: '2016092300579138',
    // notifyUrl 通知地址
    notifyUrl: 'http://127.0.0.1:3000/pay/notify',
    // 私钥路径
    rsaPrivate: path.join(__dirname, '/rsa_private_key.pem'),
    // 公钥
    rsaPublic: path.join(__dirname, '/rsa_public_key.pem'),
    // 是否是测试环境
    sandbox: true,
    // 加密算法到的类型
    signType: 'RSA2'
});

exports.getPayUrl = (order) => {
    /**3.通过以上实例可以对参数进行加密 */
    /**4.每个订单不一样，参数不一样 */
    const params = alipay.pagePay({
        // subjectz支付标题
        subject: '品优购商品',
        // body具体哪一些商品，所有商品名称，每个商品换一行
        body: order.products.map((item, i) => item.name).join('\n'),
        // outTradeId 商户的交易编号
        outTradeId: order.order_number,
        // timeout支付超时时间
        timeout: '10m',
        // amount支付金额
        amount: order.total_price,
        // goodsType商品类型 虚拟0 实物 1
        goodsType: '1',
        // qrPayMode二维码支付模式，确定二维码的类型
        // [opts.qrPayMode]          PC扫码支付的方式，支持前置模式和跳转模式。前置模式是将二维码前置到商户的订单确认页的模式，需要商户在自己的页面中以 iframe 方式请求支付宝页面。详见https://www.npmjs.com/package/alipay-node-sdk
        qrPayMode: 2,
        // 客户端回调地址
        return_url: 'http://127.0.0.1:3000/pay/callback'
    });
    return 'https://openapi.alipaydev.com/gateway.do?' + params
}