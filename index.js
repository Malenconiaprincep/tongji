var koa = require('koa');
var request = require('request')
var thunkify = require('thunkify')
var co = require('co')
let BemEmail = require('bem-email');

var formData = {
  // Pass a simple key-value pair
  hospital_id: '93cada65-18d9-42ad-9155-82a2cc8cb1b0',
  // Pass data via Buffers
  scheduleId: 285596,
  // Pass data via Streams
};
// let emailVerifyUrl = '279495889@qq.com'
// let emailAddress = '279495889@qq.com'
// let email = new BemEmail({
//   AccountName: 'service@notice.bemcloud.com',
//   AccessKeySecret: 'LDAxHNXsvIrhe6u8gZdrLhg3Z74Htq',
//   AccessKeyId: '8M00ud3AlevC2dJp'
// });
// let textbody = '验证邮箱: ' + emailVerifyUrl;
// console.log(textbody);
// let result = yield email.sendMail({
//   ToAddress: emailAddress,
//   Subject: 'test from aliyun',
//   TextBody: textbody
// });


co(function*() {
  yield thunkify(request.post)({url:'http://weixin.znhospital.com:9060/wx_zn/gh!obtainSchedulePartTime.html', formData: formData})(function optionalCallback(err, httpResponse, body) {
	  if (err) {
	    return console.error('upload failed:', err);
	  }
	  console.log(body);
	});
});