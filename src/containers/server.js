let server = require('express');
let status_codes = require('_http_server').STATUS_CODES;
let app = server();

// 会把此路径和客户端的请求路径进行匹配   匹配的是前缀  请求路径是以/user/开头的
app.use((req,res,next)=>{
    res.setHeader('content-type','text/html;charset=utf-8;');
    next();
});

app.use((req, res, next) => {
    res.send = params => {
        let type = typeof params;
        switch (type) {
            case  'object':
                params = JSON.stringify(params);
                break;
            case 'number':
                res.StatusCodes = params;
                params = status_codes[params];
                break;
        }
        res.end(params);
    };
    next();
});

let commodity= require('../components/commodity');
app.use('/commodity',commodity);


app.all('*', (req, res) => {
    res.setHeader('content-type', 'text/html;charset=utf-8');
    res.send({flag:0,"message": "请求的路径不存在"});
});

app.listen(3005);










