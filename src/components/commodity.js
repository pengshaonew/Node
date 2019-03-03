let express = require('express');
let fs = require('fs');
let path = require('path');
// 返回一个Router的实例
let commodity = express.Router();

let commodityDataPath = path.join(__dirname, '../data/commodityData.json');
let commodityDataRecordPath = path.join(__dirname, '../data/commodityDataRecord.json');
// 小程序 查询商品列表
commodity.post('/mobile/commodityList', (req, res) => {
    req.on('data', function (parms) {
        let request = JSON.parse(parms.toString());
        fs.readFile(commodityDataRecordPath, (err, data) => {
            if (err) {
                return console.error(err);
            }
            data = JSON.parse(data.toString());
            let dataList = data.data;
            dataList = dataList.filter(item => item.createDate === request.createDate && item.parentId == request.classId);
            res.send(dataList);
        })
    });
});

//查询商品列表
commodity.post('/commodityList', (req, res) => {
    req.on('data', function (parms) {
        let request = JSON.parse(parms.toString());
        fs.readFile(commodityDataPath, (err, data) => {
            if (err) {
                return console.error(err);
            }
            data = JSON.parse(data.toString());
            let dataList = [...data.data];
            let total = data.data.length;
            let {pageNum, pageSize, classId} = request;
            if (request.classId) {
                dataList = dataList.filter(item => item.parentId === classId);
                total = dataList.length;
            }
            dataList = dataList.splice(pageSize * ((pageNum || 1) - 1), pageSize);
            res.send({
                pageNum,
                pageSize,
                total,
                list: dataList
            });
        })
    });
});

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

//新增构件
commodity.post('/addCommodity', (req, res) => {
    if (!isLogin(req, res)) {
        return;
    }
    fs.readFile(commodityDataPath, (err, data) => {
        if (err) {
            return console.error(err);
        }
        req.on('data', function (parms) {
            let request = JSON.parse(parms.toString());
            data = JSON.parse(data.toString());
            let dataList = data.data;
            let count = data.count + 1;
            request.id = count;
            dataList.push(request);
            data.count = count;
            data.data = dataList;
            let str = JSON.stringify(data);
            writeFileCommodity1(str, res);
            writeFileCommodity2(str);
        });
    })
});


//删除商品
commodity.post('/deleteCommodity', (req, res) => {
    if (!isLogin(req, res)) {
        return;
    }
    fs.readFile(commodityDataPath, (err, data) => {
        if (err) {
            return console.error(err);
        }
        req.on('data', function (parms) {
            let request = JSON.parse(parms.toString());
            data = JSON.parse(data.toString());
            let dataList = data.data;
            dataList = dataList.filter(item => item.id !== request.id);
            data.data = dataList;
            let str = JSON.stringify(data);
            writeFileCommodity1(str, res);
        });
    });
    fs.readFile(commodityDataRecordPath, (err, data) => {
        if (err) {
            return console.error(err);
        }
        req.on('data', function (parms) {
            let request = JSON.parse(parms.toString());
            data = JSON.parse(data.toString());
            let dataList = data.data;
            dataList = dataList.filter(item => item.id !== request.id);
            data.data = dataList;
            let str = JSON.stringify(data);
            writeFileCommodity2(str);
        });
    });
});

//修改商品信息
commodity.post('/updateCommodity', (req, res) => {
    if (!isLogin(req, res)) {
        return;
    }
    fs.readFile(commodityDataRecordPath, (err, data) => {
        if (err) {
            return console.error(err);
        }
        req.on('data', function (parms) {
            let request = JSON.parse(parms.toString());
            data = JSON.parse(data.toString());
            let dataList = data.data;
            dataList = dataList.map(item => {
                if (item.id === request.id) {
                    item = request;
                }
                return item;
            });
            data.data = dataList;
            let str = JSON.stringify(data);
            writeFileCommodity1(str, res);
            writeFileCommodity2(request,true);
        });
    })
});

//检测商品名称
commodity.post('/checkCommodityName', (req, res) => {
    fs.readFile(commodityDataPath, (err, data) => {
        if (err) {
            return console.error(err);
        }
        req.on('data', function (parms) {
            let request = JSON.parse(parms.toString());
            data = JSON.parse(data.toString());
            let dataList = data.data;
            let flag = !dataList.some(item => item.id !== request.id && item.parentId === request.parentId && item.name === request.name);
            data.data = dataList;
            res.send({
                "flag": 1,
                data: flag
            });
        });
    })
});


writeFileCommodity1 = (str, res) => {
    fs.writeFile(commodityDataPath, str, function (err) {
        if (err) {
            console.error(err);
        }
        res.send({
            "flag": 1,
            "message": "success"
        });
    })
};

writeFileCommodity2 = (str,flag) => {
    if(flag){
        let request = str;
        fs.readFile(commodityDataRecordPath, (err, data) => {
            if (err) {
                return console.error(err);
            }
            data = JSON.parse(data.toString());
            let dataList = data.data;
            let flag = dataList.some(item => item.id === request.id && item.createDate === request.createDate);
            if(flag){
                dataList=dataList.map(item=>{
                    if(item.id === request.id && item.createDate === request.createDate){
                        item=request;
                    }
                    return item;
                })
            }else{
                let count = data.count + 1;
                request.id = count;
                dataList.push(request);
                data.count = count;
            }
            data.data = dataList;
            let str = JSON.stringify(data);
            writeFileCommodity2(str);
        })
    }else{
        fs.writeFile(commodityDataRecordPath, str, function (err) {
            if (err) {
                console.error(err);
            }
            console.log('记录成功');
        })
    }
};

module.exports = commodity;






