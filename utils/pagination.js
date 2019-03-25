// 目的：返回分页的HTML格式的代码
const path = require('path')
const template = require('art-template')
const url = require('url')
module.exports = (options) => {
    /**1. 准备封装分页组件需要的 数据 
     * 数据有page total btnNum 不能直接写参数，因为参数的顺序是不确定的，这里传递options，类型是对象，
     * options {page,total,btnNum,url}btnNum可以传，不传就采用默认值，page和total是必须传的
     */
    if (!(options.page && options.total)) return ''
    const {
        page,
        total
    } = options
    const btnNum = options.btnNum || 5
    /**2. 准备封装分页组件需要的 模板 */
    // 在views/component/pagination.art中准备
    /**3. 计算起始页码和结束页码 */
    /**a. 理想情况 */
    let end = page + Math.floor(btnNum / 2)
    let start = end - btnNum + 1
    /**b. end值大于总页数 */
    end = end > total ? total : end
    start = end - btnNum + 1
    /**c. 如果start小于1 */
    start = start < 1 ? 1 : start
    end = start + btnNum - 1
    /**d. end值大于总页数 */
    end = end > total ? total : end

    /**--------实现分页按钮的跳转-----------*/
    /**1.需要跳转的url地址 /list/1?sort=commend&page=1
     * 2.url需要包含其他传参，其他传参保持不变，当前页码的page的值要改变，
     * 3.url操作在js中进行方便一些
     * 4.url本身是字符串，操作不方便，可以转换成对象，使用url内置模块
     * 5.使用url内置模块转换成对象
     */
    // const urlObject = url.parse(options.url) //可以在list.js传参的时候，把url传进来,urlObject.query是键值对字符串
    const urlObject = url.parse(options.url, true) //urlObject.query是对象
    // console.log(urlObject);
    /**6.可以比较方便的修改page，但是修改的page的值，只有在模板中才知道
     * 7.可以定义一个函数，可以传参，page，定义一个函数，动态的拿到url地址
     * 8.修改query中的page参数
     */
    const getUrl = (page) => {
        // 8.修改query中的page参数
        urlObject.query.page = page
        // 9.把对象转换成url地址
        urlObject.search = undefined //只有当search是undefined的时候，才会用query去拼接地址
        const urlStr = url.format(urlObject)
        return urlStr
    }
    // console.log(getUrl(4));
    /**10.模板内无法使用外部的变量 ，可以通过参数传递进去getUrl*/


    /**-----实现点击确认，根据输入的页码进行跳转------*/
    /**1.如果通过js实现，并且在浏览器端运行，操作麻烦
     * 2.可以使用form表单提交，提交的时候除了提交输入的page，之前的url上的参数也进行提交
     * 在表单内生成其他传参的隐藏的输入框，只显示page输入框即可
     */





    /**4. 结合数据和模板 动态生成分页HTML格式代码 */
    /**artTemplate可以在浏览器端使用， template(模板ID,数据)*/
    /**artTemplate可以在Node.js使用， template(模板路径,数据)*/
    const templateUrl = path.join(__dirname, '../views//component/pagination.art')
    const html = template(templateUrl, {
        page,
        total,
        btnNum,
        start,
        end,
        getUrl,
        pathname: urlObject.pathname,
        query: urlObject.query
    })
    return html
}