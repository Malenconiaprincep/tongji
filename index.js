var koa = require('koa');
var request = require('request')
var thunkify = require('thunkify')
var co = require('co')

var formData = {
  // Pass a simple key-value pair
  hospital_id: '93cada65-18d9-42ad-9155-82a2cc8cb1b0',
  // Pass data via Buffers
  // scheduleId: 285596,
  scheduleId: 285428,

  
  // Pass data via Streams
};

function *sendMessage(phone) {
    let res = yield thunkify(request)({
      url: 'http://yunpian.com/v1/sms/send.json',
      method: 'POST',
      form: {
        mobile: phone,
        apikey: 'cd9f8e6871bcc421ac689cc4d8352b5b',
        text: '【BemCloud】您的验证码是1。如非本人操作，请忽略本短信'
      }
    });
    return res
}


co(function*() {
  let res = yield thunkify(request)({
          url:'http://weixin.znhospital.com:9060/wx_zn/gh!obtainSchedulePartTime.html', 
          method: 'POST',
          formData: formData
      });
  res = res[0]
  let data = JSON.parse(res.body)
  if(data.rc == -1){
      console.log('不发')
  }

  if(data.rc == 1){
      console.log('发')
      let phone = 18611515379
      let res = yield sendMessage(phone)
      console.log(res)

  }
});