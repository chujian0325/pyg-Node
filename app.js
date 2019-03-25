// 入口文件 主体文件 使用MVC思想构建项目
// models/ 数据模型 获取接口服务器数据
// views/ 视图层  渲染页面
// controllers/ 控制器  组织请求对应的url进行业务处理
// public/ 静态资源
// utils  工具类
const Youch = require('youch')
const artTemplate = require('express-art-template')
const createError = require('http-errors')
const path = require('path')
const favicon = require('express-favicon')
const middlewares = require('./middlewares')
const routers = require('./routers')
const config = require('./configs')


/**1. 创建web应用 */
const express = require('express')
const app = express()
app.listen(3000, () => {
    console.log("pyg64 Server Started")
})
/**4. 业务处理之前配置公用的中间件 */
/**4.1 配置模板引擎 art-template */
app.engine('art', artTemplate); // 设置一个叫art的模板引擎，设置了模板引擎，就可以使用模板引擎的render方法
// 默认页面修改后被缓存了，而且被压缩了，模板引擎默认的是生产环境的配置
// debug使用的是布尔值，false 生产环境 true开发环境->实时更新页面，不进行压缩
app.set('view options', {
    // 开发环境才需要调试，生产环境不需要调试，这里需要判断环境
    // debug: ?
    // Node.js内置对象process，process.env是所有的环境变量
    debug: process.env.NODE_ENV === 'development'
    // 这样就分两种情况去处理页面了
});
/**4.2 公布静态资源，这里不加前缀，公布public下的资源，使用绝对路径 */
app.use('/', express.static(path.join(__dirname, '/public')))
/**4.3 浏览器会自动发送网站小图标的请求，路径是 域名/favicon.ico ，*/
// 可以把图标放在public下面 ，如果公布静态资源的时候加了前缀，那么请求网页图标的路径就要加上public 
// 建议使用express-favicon统一处理小图标，这样icon的路径就可以放在任何位置，使用绝对路径
app.use(favicon(path.join(__dirname, './favicon.ico')));


/**使用session的步骤 npm官网查询如何使用
 * 1.安装包 express-session express-mysql-session
 * 2.导包
 * 3.获取持久化构造函数
 * 4.连接mysql的配置项，我们统一把配置项写在config里面，config里面的mysql中
 * 5.初始化持久化对象
 * 6.使用session中间件
 */
// 2.导包
const session = require('express-session')
const mysqlSession = require('express-mysql-session')
// 3.获取持久化构造函数
const MySqlStore = mysqlSession(session)
// 5.初始化持久化对象
const sessionStore = new MySqlStore(config.mysql)
// 6.使用session中间件
app.use(session({
    key: 'PYGSID', //session id
    secret: 'PYG_secret', //加密字符
    store: sessionStore, //持久化对象
    resave: false, //重新保存session，当session有有效期的时候，会设置成true
    saveUninitialized: false //是否在服务器启动的时候初始化session对象，还是在使用session的时候，初始化session对象
}))


/**cookie解析中间件 */
const cookieParser = require('cookie-parser')
app.use(cookieParser())

// 处理post提交数据中间件
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))



// 自定义中间件
app.use(middlewares.global, middlewares.headCart)
app.use(routers)

/**2. 定义业务路由 */
// app.get('/', (req, res, next) => {
//     // 假如程序运行时错误，youch也可以定位到错误
//     // throw createError(500, "Server Error")
//     // res.send('server ok')
//     res.render('home.art')
// })
/**3. 错误统一处理 */
/**3.1 资源未找到 */
app.use((req, res, next) => {
    // 走到这里，说明资源未找到(定义业务路由中写了所有的路由，如果前面的路由都不匹配，会来到这个中间件，说明资源未找到)
    // 如果请求走到这个中间件,证明所有的业务不符合URL,意思是资源未找到
    // 可以自己创建一个错误
    // const error = new Error("Not Found")
    // error.status = 404
    // 介绍一个创建HTTP错误的插件http-errors
    // 传递http-errors创建的错误
    // 把错误交给下面的错误处理中间件
    next(createError(404, "Not Found"))
})
/**3.2 程序运行错误 */
// 错误处理中间件
app.use((err, req, res, next) => {
    // 运行的时候，程序有异常会走到这个中间件
    // 处理错误
    // 怎么判断项目运行环境?
    // 1.计算机设置环境变量
    // 2.使用cross-env插件设置
    // 在执行运行项目的命令之前，可以加上设置环境变量的命令，使用的是一个cross-env环境变量设置，基于Node.js的命令行工具->cross-env -> npm i cross-env -g 跨平台，在不同的系统都可以使用 注意：设置是在内存中
    // 怎么获取环境变量--express提供的(express官网可查)
    const env = req.app.get("env")
    // console.log(env);

    if (env === "development") {
        // 1. 如果是开发环境
        // 要能够直观的观察到异常信息，准确的定位到错误的代码
        // -> 把具体的错误信息输出到页面，页面返回的是字符串，而err是对象，不能直接输出，这里使用youch包美化错误信息，准确定位错误位置 npm i youch
        // res.send(err)
        new Youch(err, req).toHTML().then((html) => res.send(html))

    } else {
        // 2. 如果是生产环境(上线的，用户可以访问到的)
        // 返回漂亮的页面
        // 渲染两个类型的页面 404 和 500页面，美观一些
        // 这里返回一个页面，设置不同的背景
        // 动态返回页面error.art，放在views中，要返回页面，使用模板引擎art-template

        // 生产环境下输出一个页面，需要区分是404还是500，
        // 生产环境下无论是404还是500都会来到这里，我们可以在资源未找到的时候，给err加一个状态码
        // console.log(err.status); // 响应状态码 错误代码
        // 传递一个状态码给模板
        res.render('error.art', {
            status: err.status
        })
    }
})