let server = require('express');
let fs = require('fs');
const path = require('path');
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

let commodity= require('./components/commodity');
app.use('/commodity',commodity);

//查询分类名称 项目名称
app.post('/class/classList', (req, res) => {
    fs.readFile('./data/classificationData.json', (err, data) => {
        if (err) {
            return console.error(err);
        }
        data = JSON.parse(data.toString());
        res.send(data);
    })
});

//上传商品图片
app.post('/upload/commodityImg', (req, res) => {
    var form = new formidable.IncomingForm();
    var targetFile = path.join(__dirname,'./upload');
    form.uploadDir = targetFile;
    form.parse(req,function(err,fields,files){
        if(err) throw err;
        var oldpath = files.file.path;
        let filename=new Date().getTime()+/(\.\w+)$/.exec(files.file.name)[1];
        var newpath = path.join(path.dirname(oldpath),filename);
        fs.rename(oldpath,newpath,(err)=>{
            if(err) throw err;
            res.writeHead(200,{"Content-Type":"text/html;charset=UTF8"});
            res.send({
                flag:1,
                message:'图片上传成功！',
                url:`http://localhost:3005/upload/${filename}`
            });
        })
    });
});


writeFileClass = (str, res) => {
    fs.writeFile('./data/classificationData.json', str, function (err) {
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

app.get('/upload/*', function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/plain;charset=utf-8'});
    res.sendFile(__dirname + req.url);
    console.log(__dirname + req.url);
})

app.all('*', (req, res) => {
    res.setHeader('content-type', 'text/html;charset=utf-8');
    res.send({flag:0,"message": "请求的路径不存在"});
});

app.listen(3005,()=>{
    console.log('服务启动');
});










