var koa = require('koa');
var request = require('request');
var thunkify = require('thunkify');
var fs = require('fs');
// var Redis = require('bem-redis');
var crypto = require('crypto');
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex');
};
var co = require('co');

var config = require('./config.js')
var headers = config.headers
var cookie_h_i = config.cookie_h_i


/**************************************************/

// 汪佳
var patientId = 19358836

// 曾万江
var formData = {
  doctorId: '01446f89-8a3a-4ad3-9a6b-952131b6dc12',
  hospDeptId: "2f33d9d3-44e0-4401-8ecd-4fdec61e6093",
  type: 0
}

var date = '2017-05-24'

/**************************************************/

// 李辉
// var patientId = 19398412


// 乔福元
// var formData = {
//   doctorId: '58d05303-5aec-4102-9a58-0766ace0189c',
//   hospDeptId: "293a6281-db6f-45af-9911-1155600500a6",
//   type: 0
// }


// var date = '2017-05-23'


/**************************************************/


// test

// var formData = {
//     doctorId: '550c2602-63dd-41ed-bb52-65e3c8c64358',
//     hospDeptId: 'c09e644f-2640-4b28-881f-ce9ff9c97e42',
//     type:0
// }

// var date = '2017-05-22'



/*
 *  二维码需要刷的  有时效
 *  http://appservice.tjh.com.cn//common/checkcode/getimagecode?imageCodeId=d22621bb-0c90-4557-a399-fec37fd27e5a&time=1494309004464
 */

var imageCode = 'eyape'

/*
 *  cookie_h_i http only 自己从控制台拿
 */

// var cookie_h_i = 'FzM0dx66otrG3p4+BpuhykCzq4GaDgWI7+farJ3jlSk='

/*
 *  headers 自定义头部 需要重新登录 有时效
 */
// var headers = {
//   authentication: 'v+A+k/+w70eIO2AHWsoOLO1rKJHOf+HzgSbwUFw3noDqZBBM3WRDJNtsZ7tR4v8h14BJNRaIZCRMEset2T/5zyi8eNtDKaUPp4GAThJttCrK9VqiwGBB+quN6WPFl0ye',
//   'os-type': 'h5',
//   'Content-Type' : 'application/json;charset=UTF-8'
// }

// var limitRedis = Redis.get();
var count = 0;
function* sendMessage(phone) {
  let res = yield thunkify(request)({
    url: 'http://yunpian.com/v1/sms/send.json',
    method: 'POST',
    form: {
      mobile: phone,
      apikey: 'cd9f8e6871bcc421ac689cc4d8352b5b',
      text: '【BemCloud】您的验证码是8888',
    },
  });
  return res;
}

function* getCaptcha(hospitalId, shiftCaseId) {
  let res = yield thunkify(request)({
    url: 'http://appservice.tjh.com.cn//order/ordermsg/getcheckcode.json',
    method: 'POST',
    headers: headers,
    json: {
      "extend":hospitalId + "_" + shiftCaseId,
      "patientId":patientId,
      "codeSendType":1,
      "imageCodeId":"d22621bb-0c90-4557-a399-fec37fd27e5a",
      "imageCode":imageCode
    }
  })
  res = res[0];
  var data = res.body;
  return data
}

function* getReserve(shiftCaseId, hospitalId) {
  var j = request.jar();
  var cookie = request.cookie('_h_i__=' + cookie_h_i);
  var url = 'http://app.tjh.com.cn/my/order/reserve/'+shiftCaseId+'?hospitalId='+hospitalId+'&patientId='

  j.setCookie(cookie, url);
  let res = yield thunkify(request)({
    url:  url,
    jar: j,
    method: 'GET',
    // headers: headers,
  })
  res = res[0];
  var data = JSON.parse(res.body);
  // console.log(data.data.timeSections[0])
  return data.data.timeSections[0]
}

function* getSalt(){
  let res = yield thunkify(request)({
    url: 'http://app.tjh.com.cn/security/getsalt?t=1492942257572',
    method: 'POST',
    headers: headers,
  })

  res = res[0];
  // console.log(res)
  var data = JSON.parse(res.body);
  return data.data
}

function* getSubmit(options) {
  // let res = yield thunkify(request)({
  //   url: 'http://app.tjh.com.cn/my/submitorder/dosubmit',
  //   method: 'POST',
  //   headers: headers,
  //   json: {
  //     "patient":{"id":patientId},
  //     "hospDeptId":options.hospDeptId,
  //     "expertId":options.expertId,
  //     "checkCode":options.checkCode,
  //     "shiftCaseId":options.shiftCaseId,
  //     "timeSectionId":options.timeSectionId,
  //     "timeSection":options.timeSection,
  //     "requiredDatas":[{"name":"cardType"},{"name":"cardValue","value":null}],
  //     "signData":options.signData
  //   }
  // })
  // res = res[0];
  // var data = res.body;
  var data = JSON.stringify({
      "checkCode":options.checkCode,
      "patient":{"id":patientId},
      "hospDeptId":options.hospDeptId,
      "expertId":options.expertId,
      "shiftCaseId":options.shiftCaseId,
      "timeSectionId":options.timeSectionId,
      "timeSection":options.timeSection,
      "requiredDatas":[{"name":"cardType"},{"name":"cardValue","value":null}],
      "signData":options.signData
    })

  console.log('****************************')
  console.log(JSON.stringify({
      "checkCode":options.checkCode,
      "patient":{"id":patientId},
      "hospDeptId":options.hospDeptId,
      "expertId":options.expertId,
      "shiftCaseId":options.shiftCaseId,
      "timeSectionId":options.timeSectionId,
      "timeSection":options.timeSection,
      "requiredDatas":[{"name":"cardType"},{"name":"cardValue","value":null}],
      "signData":options.signData
    }))
  console.log('****************************')


  fs.writeFileSync('config.json', data, 0, 'utf-8');
  // return data
}

co(function*() {
  var res = yield thunkify(request)({
    url: 'http://appservice.tjh.com.cn//doctor/doctorshiftcase/list.json',
    headers: headers,
    method: 'POST',
    json: formData,
  });
  res = res[0];
  var data = res.body;
  var filterData = data.items.filter(function(item) {
    return item.date == date;
  });

  if (filterData.length === 0) {
    console.log('目前没有符合之类排期');
    process.exit();
  }
  if (filterData[0].status === '4') {

    // 发验证码
    let res = yield getCaptcha(filterData[0].hospitalId, filterData[0].shiftCaseId)
    console.log(JSON.stringify(res) + '>>> getCaptcha')

    let timeSections = yield getReserve(filterData[0].shiftCaseId,filterData[0].hospitalId)

    let salt = yield getSalt()

    let signData = md5("TJ_RES_CODE_MOBILE" + filterData[0].shiftCaseId + salt)

    let submit = yield getSubmit({
      hospDeptId: filterData[0].hospDeptId,
      expertId: formData.doctorId,
      shiftCaseId: filterData[0].shiftCaseId,
      timeSectionId:timeSections.timeId,
      timeSection: timeSections.timeSection,
      signData: signData,
      checkCode: 123456
    })

    process.exit();
  } else {
    console.log('目前没有符合之类排期');
    process.exit();
  }
}).catch(err => {
  console.log(err);
});
