var koa = require('koa');
var request = require('request')
var thunkify = require('thunkify')
var Redis = require('bem-redis')
var co = require('co')

var formData = {
  // Pass a simple key-value pair
  hospital_id: '93cada65-18d9-42ad-9155-82a2cc8cb1b0',
  // Pass data via Buffers
  // scheduleId: 285428,
  doctor_no: '000162',
  dept_code: '0062'

  // Pass data via Streams
};
var limitRedis = Redis.get()
var count = 0
function *sendMessage(phone) {
    let res = yield thunkify(request)({
      url: 'http://yunpian.com/v1/sms/send.json',
      method: 'POST',
      form: {
        mobile: phone,
        apikey: 'cd9f8e6871bcc421ac689cc4d8352b5b',
        text: '【BemCloud】您的验证码是8888'
      }
    });
    return res
}


co(function*() {
  var res = yield thunkify(request)({
          url: 'http://weixin.znhospital.com:9060/wx_zn/gh!doctorSchedule.html',
          method: 'POST',
          form: formData
      });
  res = res[0]
  var data = JSON.parse(res.body)

  var filterData = data.filter(function(item){
      return item.outpdate == '2017-01-17'
  })

  if(filterData.length === 0){
    return false
  }

  var res = yield thunkify(request)({
          url:'http://weixin.znhospital.com:9060/wx_zn/gh!obtainSchedulePartTime.html',
          method: 'POST',
          form: Object.assign(formData,{
            scheduleId: filterData[0].scheduleid
          })
      });
  res = res[0]
  var data = JSON.parse(res.body)
  if(data.rc == -1){
      console.log('不发')
  }

  if(data.rc == 1){
      var key = 'guahao' + filterData[0].scheduleid
      var reply = yield thunkify(limitRedis.get).call(limitRedis, key);
      count = reply
      if (count > 5) {
          process.exit()
      }

      let phone1 = 13041117850
      let res1 = yield sendMessage(phone1)
      let phone2 = 18611515379
      let res2 = yield sendMessage(phone2)

      limitRedis.set(key, ++count)
      process.exit()
  }else{
    process.exit()
  }
});
