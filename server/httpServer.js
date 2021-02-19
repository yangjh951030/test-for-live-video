
const http = require('http');
const url = require('url');
let fs = require('fs');
function start(){ // 服务器函数
    function onRequest(request, response) {
        if(request.url !=="/favicon.ico"){ // 去掉这个请求，否则每次请求两次
            response.setHeader("Access-Control-Allow-Origin", "*");//允许的header类型
            response.setHeader('Access-Control-Allow-Headers', 'Content-type');//跨域允许的请求方式
            response.setHeader("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS,PATCH");
        　　//可选，用来指定本次预检请求的有效期，单位为秒。在此期间，不用发出另一条预检请求。
            //response.setHeader('Access-Control-Max-Age',1728000);//预请求缓存20天,强缓存，不需要
            request.setEncoding("utf8"); // 设置格式
            let context = {};  // 利用context保存处理结果
            context.req = request;
            context.res = response;
            context.method = request.method;
            if (request.method === 'GET') { // get 方法
                let data =  url.parse(request.url,true); // 需要把路由的参数分割
                context.data = data;
                context.pathname = data.pathname;
                console.log(data.pathname);
                context.query = data.query;
                console.log(data.query);
                handleGetRequest(context);
            } else if(request.method === "POST"){ // post 方法
                context.pathname = request.url;
                let postData = '';
                request.on('data', chunk => {
                    postData += chunk;
                })
                request.on('end', () => {
                    context.body = postData;
                    context.param = postData;
                })
                handlePostRequest(context);
            }
        }
      }    
    http.createServer(onRequest).listen(8000);
    console.log('server is running at http://localhost:8000');
}

function handleGetRequest(context){
    if(context.pathname === '/video'){
        openVideo(context.query.status,context);
    }
}
function handlePostRequest(context){
    console.log('do something')
}
function openVideo(status,context){ // 打开这个文件发送
    // context.res.writeHead(200, {'Content-Type': 'video/mp4'}); 
    let video;
    let videoStream = fs.createReadStream('./'+ status +'.webm');
    // videoStream.on('data',function(chunk){
    //     context.res.write(chunk);
    // });
    videoStream.pipe(context.res);
    videoStream.on('end',function(){
        context.res.end();
    });
    videoStream.on('error',function(){
        console.log('读文件出错');
    })
}
module.exports = start;