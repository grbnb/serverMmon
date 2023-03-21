var express = require('express');
var router = express.Router();
var request = require('request');
// 获取配置
const db = require('../common/data').serverList;
let arrServer = []
function createComprisonFunction(propertyName){
  return function(object1,object2){
      var value1 = object1[propertyName];
      var value2 = object2[propertyName];
      if(value1 < value2){
          return -1;
      }else if(value1 > value2){
          return 1;
      }else{
          return 0;
      }
  }
}
async function getServeOption(data) {
  return new Promise((resolve, reject) => {
      request({
        url: 'http://'+data.url+"/serve",
        method: "POST",
        json: true,
        headers: {
            "content-type": "application/json",
        },
        // timeout:2500,
        body: JSON.stringify(data)
      }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            if(body.code==200){
                arrServer.push({
                  name:data.name,
                  location:data.location,
                  region:data.region,
                  getStatus:true,
                  id:data._id,
                  updata:data.updata,
                  data:body
                })
            }else{
                arrServer.push({
                  name:data.name,
                  location:data.location,
                  region:data.region,
                  getStatus:false,
                  id:data._id,
                  updata:data.updata,
                  data:[]
                })
            }
            
        }else{
            arrServer.push({
              name:data.name,
              location:data.location,
              region:data.region,
              getStatus:false,
              id:data._id,
              updata:data.updata,
              data:[]
            })
        }
        resolve()
        
      });
  })
}

let timer = undefined
let newData;
if(timer!=undefined){
      clearInterval(timer)
    timer = undefined
  }
  timer = setInterval(async () => {
      try {
        arrServer = []
        let config = await db.find();
        for(var promiseArr = [], i = 0; i < config.length; i++) {
            promiseArr.push(getServeOption(config[i]))
        }
        
        
      
        Promise.all(promiseArr)
        .then(function () {
            // console.log(arrServer);
            let data = arrServer.sort(createComprisonFunction("updata"));
            newData = JSON.stringify({code:200,data:data,updated:new Date().getTime()});
        })
      } catch (error) {
        console.log(error)
      }
  }, 2500)
  
var timer1 = undefined;

router.post('/list', function(req, res, next) {
  try {
    res.send(newData);
  } catch (error) {
    console.log(error)
  }
  
});



module.exports = router;
