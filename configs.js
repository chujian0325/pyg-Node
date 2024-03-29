// 维护品优购项目所有的配置项

/**1. 网站公用信息 */
// site是站点的意思，导出
exports.site = {
    title: '品优购(PYG.COM)-正品低价、品质保障、配送及时、轻松购物！',
    description: '品优购PYG.COM-专业的综合网上购物商城，为您提供正品低价的购物选择、优质便捷的服务体验。商品来自全球数十万品牌商家，囊括家电、手机、电脑、服装、居家、母婴、美妆、个护、食品、生鲜等丰富品类，满足各种购物需求。',
    Keywords: '网上购物,网上商城,家电,手机,电脑,服装,居家,母婴,美妆,个护,食品,生鲜,品优购'
}

/**2. 接口服务器配置信息 */
exports.api = {
    // baseURL:'https://ns-api.uieee.com/v1/', // 线上的url或者使用本地的url
    baseURL: 'http://localhost:8000/v1/',
    timeout: 3000,
    username: 'newshop-frontend',
    password: 'd8667837fce5a0270a35f4a8fa14be479fadc774'
}

/**3.连接数据库配置 */
exports.mysql = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'yiran0325',
    database: 'newshop'
}

/**4. 购物车相关配置*/
exports.cartCookie = {
    key: 'pyg_cart_info',
    // 过期时间，这里设置为一个月
    expires: 30 * 24 * 60 * 60 * 1000
}
/**5. 自动登录相关配置信息 */
exports.loginCookie = {
    key: 'pyg_user_info',
    // 过期时间，这里设置为7天
    expires: 7 * 24 * 60 * 60 * 1000
}