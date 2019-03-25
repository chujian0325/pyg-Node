// 定义用户相关的路由函数
const svgCaptcha = require('svg-captcha')
const createError = require('http-errors')
const usersModel = require('../models/users')
const configs = require('../configs')
const cartModel = require('../models/cart')
// 页面展示
exports.login = (req, res, next) => {
    // res.send('ok')
    // 1.通过svg-captcha的包 生成svg格式的图片，svg标签HTML
    const captcha = svgCaptcha.createMathExpr({
        width: 120,
        height: 30,
        fontSize: 30
    });
    // 2.captcha {data: svg格式的图片, text: 图片的内容或公式的结果} 图片的内容可能是字符，也可能是运算公式
    res.locals.svg = captcha.data
    req.session.text = captcha.text //记录结果，下次校验
    // 需要回跳的地址，记录下回跳的地址，传递到模板中的form表单，在post的时候，才能拿到回跳地址
    res.locals.returnUrl = req.query.returnUrl || '/member' //member个人中心首页
    res.render('login.art')
}


// 登录逻辑,表单提交
exports.loginLogic = (req, res, next) => {
    /**需求
     * 1.保证表单数据的完整性 校验
     * 2.验证码校验
     * 3.用户名和密码校验 调接口
     * 4.如果选中了自动登录，准备自动登录的数据
     * 5.合并购物车(浏览器中的购物车信息，合并到登陆后的账户下，清空浏览器中的购物车)
     * 6.补充：错误提示统一处理
     */
    const {
        username,
        password,
        captcha,
        auto
    } = req.body
    // 如果表单输入不完整，需要处理错误，这里不能进入错误统一处理中间件，因为错误统一处理中间件是返回404或500页面，这里不需要，所以要单独处理错误，这里使用Promise，resolve里面的代码一定是成功之后才会执行，如果错误，会被catch捕获
    Promise.resolve().then(() => {
            // 1.保证表单数据的完整性 校验
            // 如果信息不完整
            // 直接抛出异常，创建一个错误，状态码是456，随便写的，为了区分是程序运行的错误还是自己创建的错误
            if (!(username && password && captcha)) throw createError(456, '表单必须输入完整')
            //2.验证码校验
            // 用户提交的svg和上一次创建的svg(在返回登录页面的时候创建的svg)作比较
            if (captcha !== req.session.text) throw createError(456, '验证码错误')
            //3.用户名和密码校验 调接口
            return usersModel.login(username, password) //在Promise中return了一个Promise对象，在下一个.then()中处理成功的回调，所有的错误都会走catch()
        })
        .then(user => {
            // console.log(user);//user是用户信息
            if (!user) throw createError(456, '登录失败')
            // 登陆成功
            req.session.user = user
            // res.json(user)
            // 判断auto的值是否为1， 是否不存在
            if (auto) {
                //4.如果选中了自动登录，准备自动登录的数据
                // 保存在cookie中，得约定好字段名，值，过期时间，在configs中配置
                // 把cookie存储到客户端，但是不能让客户端操作cookie，express官网-API-response-res.cookie()=>httpOnly:true
                res.cookies(configs.loginCookie.key, JSON.stringify({
                    id: user.id,
                    pwd: user.password
                }), {
                    expires: new Date(Date.now() + configs.loginCookie.expires),
                    httpOnly: true
                })
            }
            //5.合并购物车(浏览器中的购物车信息，合并到登陆后的账户下，清空浏览器中的购物车)
            // 5.1获取客户端存储的购物车信息
            const cartCookie = req.cookies[configs.cartCookie.key] || '[]'
            const cartList = JSON.parse(cartCookie)
            // 5.2会有若干条商品，分别添加到账户下
            // 接口文档POST users/:id/cart
            // 需要的参数：用户id，商品id和商品数量，要做这件事必须有个调接口的方法models/cart.js
            // cartModel.add()如果有十件商品，需要调十次接口，可以让这些若干次的添加，并行执行，所以这里生成一个Promise数组
            const PromiseArr = cartList.map((item, i) => cartModel.add(user.id, item.id, item.num))
            return Promise.all(PromiseArr)
        })
        .then(results => {
            // 合并成功
            // 5.3如果全部合并成功,清除客户端的购物车信息
            // 清除cookie
            res.clearCookie(configs.cartCookie.key)
            // 登录成功，业务完成，响应客户端
            // 如果没有来源，响应个人中心首页，如果有来源，从哪里来，回哪里去
            // 需要获取returnUrl，但是业务场景没有这个数据，在post提交的时候，没有提交returnUrl，可以在提交的时候，传递一个，隐藏 的input->login.art
            res.redirect(req.body.returnUrl || '/member')


        })
        .catch(err => {
            //6.补充：错误提示统一处理
            // 6.1在页面展示错误提示信息
            // 6.2有两种提示信息：自己创建的信息，程序运行时的错误信息 ,456状态码是我们自己创建的错误
            if (err.status === 456) {
                res.locals.msg = err.message
            } else {
                // console.log(err);
                // console.log(err.response.data.message)
                if (err.response) {
                    res.locals.msg = err.response.data.message || '登录失败'
                } else {
                    res.locals.msg = '登录失败'
                }
            }
            // 6.3重新生成验证码
            const captcha = svgCaptcha.createMathExpr({
                width: 120,
                height: 30,
                fontSize: 30
            });
            res.locals.svg = captcha.data
            // 出现错误的时候，更新text
            req.session.text = captcha.text //记录结果，下次校验
            // 如果登录失败，又会渲染login，需要再次携带returnUrl
            res.locals.returnUrl = req.body.returnUrl || '/member' //member个人中心首页
            // 如果有错误，返回登录页面
            res.render('login.art')
        })
    // res.send('ok')
}



// 退出登录
exports.logout = (req, res, next) => {
    // 删除session
    delete req.session.user
    res.redirect('/login')
}