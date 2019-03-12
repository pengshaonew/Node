let server = require('express');
let fs = require('fs');
let path = require('path');
let status_codes = require('_http_server').STATUS_CODES;
let app = server();
const session = require('express-session');
const formidable = require('formidable');

app.use((req, res, next) => {
    res.setHeader('content-type', 'text/html;charset=utf-8;');
    next();
});

app.use(session({
    secret: 'somesecrettoken',
    cookie: {maxAge: 30 * 60 * 1000}  // 1分钟
}));

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

// 会把此路径和客户端的请求路径进行匹配   匹配的是前缀  请求路径是以/chinaRailway/commodity/开头的
let commodity = require('./components/commodity');
app.use('/chinaRailway/commodity', commodity);

isLogin = (req, res) => {
    if (req.session.isLogin) {
        return true;
    } else {
        res.status(401);
        res.send({
            "flag": 0,
            "message": "登录失败"
        });
        return false;
    }
};

//查询分类名称 项目名称
app.post('/chinaRailway/class/classList', (req, res) => {
    if (!isLogin(req, res)) {
        return;
    }
    fs.readFile(__dirname + '/data/classificationData.json', (err, data) => {
        if (err) {
            return console.error(err);
        }
        data = JSON.parse(data.toString());
        res.send(data);
    })
});

//小程序查询分类名称 项目名称
app.post('/chinaRailway/mobile/class/classList', (req, res) => {
    fs.readFile(__dirname + '/data/classificationData.json', (err, data) => {
        if (err) {
            return console.error(err);
        }
        data = JSON.parse(data.toString());
        res.send(data);
    })
});

//分类 修改
app.post('/chinaRailway/class/updateClass', (req, res) => {
    if (!isLogin(req, res)) {
        return;
    }
    req.on('data', function (parms) {
        let request = JSON.parse(parms.toString());
        fs.readFile(__dirname + '/data/classificationData.json', (err, data) => {
            if (err) {
                return console.error(err);
            }
            data = JSON.parse(data.toString());
            let dataList = data.classList.map(item => {
                if (item.id === request.id) {
                    item = request;
                }
                return item;
            });
            data.classList = dataList;
            let str = JSON.stringify(data);
            writeFileClass(str, res);
        })
    });
});

//分类 删除
app.post('/chinaRailway/class/deleteClass', (req, res) => {
    if (!isLogin(req, res)) {
        return;
    }
    req.on('data', function (parms) {
        let request = JSON.parse(parms.toString());
        fs.readFile(__dirname + '/data/classificationData.json', (err, data) => {
            if (err) {
                return console.error(err);
            }
            data = JSON.parse(data.toString());
            let dataList = data.classList.filter(item => item.id !== request.id);
            data.classList = dataList;
            let str = JSON.stringify(data);
            writeFileClass(str, res);
        })
    });
});

//上传商品图片
app.post('/chinaRailway/upload/commodityImg', (req, res) => {
    if (!isLogin(req, res)) {
        return;
    }
    var form = new formidable.IncomingForm();
    var targetFile = path.join(__dirname, './upload');
    form.uploadDir = targetFile;
    form.parse(req, function (err, fields, files) {
        if (err) throw err;
        var oldpath = files.file.path;
        let filename = new Date().getTime() + /(\.\w+)$/.exec(files.file.name)[1];
        var newpath = path.join(path.dirname(oldpath), filename);
        fs.rename(oldpath, newpath, (err) => {
            if (err) throw err;
            res.writeHead(200, {"Content-Type": "text/html;charset=UTF8"});
            //TODO zhaoshaopeng 图片路径
            res.send({
                flag: 1,
                message: '图片上传成功！',
                url: `http://60.205.186.254/upload/${filename}`
            });
        })
    });
});

app.get('/upload/*', (req, res) => {
    res.setHeader('Content-Type', 'image/*');
    res.sendFile(__dirname + req.url);
    console.log(__dirname + req.url);
});

//用户登录
app.post('/chinaRailway/login', (req, res) => {
    req.on('data', function (parms) {
        let request = JSON.parse(parms.toString());
        fs.readFile(__dirname + '/data/userInfo.json', (err, data) => {
            if (err) {
                return console.error(err);
            }
            data = JSON.parse(data.toString());
            let result = data.data.find(item => {
                return item.account === request.account && item.password === request.password;
            });
            if(result && result.id){
                req.session.isLogin = true;
                res.send({
                    data:result.id,
                    message:"登录成功"
                })
            }else{
                res.send({
                    data:false,
                    message: "用户名或密码错误"
                })
            }

        })
    });
});
// 退出登录
app.post('/chinaRailway/loginOut', (req, res) => {
    req.on('data', function () {
        req.session.isLogin = false;
        res.status(401);
        res.send({
            flag:0,
            data:0,
            message:"退出成功"
        })
    });
});


// 修改项目名称，新增、删除、修改分类
writeFileClass = (str, res) => {
    fs.writeFile(__dirname + '/data/classificationData.json', str, function (err) {
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
    if (req.session.isVisit) {
        res.send({flag: 0, "message": "请求的路径不存在0"});
    } else {
        res.send({flag: 0, "message": "请求的路径不存在"});
    }
});

var server1 = app.listen(3005, () => {
    var host = server1.address().address;
    var port = server1.address().port;
    console.log('服务器启动成功host：' + host + '，port： ' + port);
});










