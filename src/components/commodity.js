let express = require('express');
let fs = require('fs');
// 返回一个Router的实例
let commodity = express.Router();

//查询商品
commodity.post('/commodityList', (req, res) => {
    fs.readFile('./data/commodityData.json', (err, data) => {
        if (err) {
            return console.error(err);
        }
        data = JSON.parse(data.toString());
        res.send(data.data);
    })
});


//新增构件
commodity.post('/addCommodity', (req, res) => {
    fs.readFile('./data/commodityData.json', (err, data) => {
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
        });
    })
});


//删除商品
commodity.post('/deleteCommodity', (req, res) => {
    fs.readFile('./data/commodityData.json', (err, data) => {
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
    })
});

//修改商品信息
commodity.post('/updateCommodity', (req, res) => {
    fs.readFile('./data/commodityData.json', (err, data) => {
        if (err) {
            return console.error(err);
        }
        req.on('data', function (parms) {
            let request = JSON.parse(parms.toString());
            data = JSON.parse(data.toString());
            let dataList = data.data;
            dataList = dataList.map(item => {
                if (item.id === request.id) {
                    item.name=request.name
                }
                return item;
            });
            data.data = dataList;
            let str = JSON.stringify(data);
            writeFileCommodity1(str, res);
        });
    })
});

//检测商品名称
commodity.post('/checkCommodityName', (req, res) => {
    fs.readFile('./data/commodityData.json', (err, data) => {
        if (err) {
            return console.error(err);
        }
        req.on('data', function (parms) {
            let request = JSON.parse(parms.toString());
            data = JSON.parse(data.toString());
            let dataList = data.data;
            let flag = !dataList.some(item =>item.id!==request.id && item.parentId===request.parentId && item.name===request.name);
            data.data = dataList;
            res.send({
                "flag": 1,
                data: flag
            });
        });
    })
});


writeFileCommodity1 = (str, res) => {
    fs.writeFile('./data/commodityData.json', str, function (err) {
        if (err) {
            console.error(err);
        }
        res.send({
            "flag": 1,
            "message": "success"
        });
    })
};

module.exports = commodity;






