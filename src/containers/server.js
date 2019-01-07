let server = require('express');
let fs = require('fs');
let status_codes = require('_http_server').STATUS_CODES;
let app = server();
const formidable = require('formidable');

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

//查询分类名称 项目名称
app.post('/class/classList', (req, res) => {
    fs.readFile('../data/classificationData.json', (err, data) => {
        if (err) {
            return console.error(err);
        }
        data = JSON.parse(data.toString());
        res.send(data);
    })
});

//上传商品图片
app.post('/upload/commodityImg', (req, res) => {
    req.on('data', function (parms) {
        var form = new formidable.IncomingForm();
        var targetFile = path.join(__dirname,'../upload');
        form.uploadDir = targetFile;
        form.parse(req,function(err2,fields,files){
            if(err2) throw err2;
            console.log(files);
            res.writeHead(200,{"Content-Type":"text/html;charset=UTF8"});
            res.send('表单提交成功！');
        });
        res.send({
            "flag": 1,
            data: flag
        });
    });
});

writeFileFn1 = (str, res) => {
    fs.writeFile('../data/classificationData.json', str, function (err) {
        if (err) {
            console.error(err);
            res.send({
                "flag": 0,
                "message": "success"
            });
        }
        res.send({
            "flag": 1,
            "message": "success"
        });
    })
};

app.all('*', (req, res) => {
    res.setHeader('content-type', 'text/html;charset=utf-8');
    res.send({flag:0,"message": "请求的路径不存在"});
});

app.listen(3005,()=>{
    console.log('服务启动');
});










