var koa = require('koa');
var request = require('request');
var thunkify = require('thunkify');
var Redis = require('bem-redis');
var co = require('co');

var formData = {
  type: 0,
  doctorId: '01446f89-8a3a-4ad3-9a6b-952131b6dc12',
  hospDeptId: '2f33d9d3-44e0-4401-8ecd-4fdec61e6093',
};

// var formData = {
//   type: 0,
//   doctorId: '511cd931-b193-4c88-9f6f-3d4959296c11',
//   hospDeptId: '2f33d9d3-44e0-4401-8ecd-4fdec61e6093',
// };

var limitRedis = Redis.get();
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

co(function*() {
  var res = yield thunkify(request)({
    url: 'http://appservice.tjh.com.cn//doctor/doctorshiftcase/list.json',
    headers: {
      authentication: '"v+A+k/+w70eIO2AHWsoOLO1rKJHOf+HzgSbwUFw3noDqZBBM3WRDJNtsZ7tR4v8h14BJNRaIZCRMEset2T/5z5/IGxm4M7eUp/TszMbPaI8KWpWOHTK00nvev76/sO9C"',
      'os-type': 'h5',
    },
    method: 'POST',
    json: formData,
  });
  res = res[0];
  var data = res.body;
  var filterData = data.items.filter(function(item) {
    return item.date == '2017-03-13';
  });

  if (filterData.length === 0) {
    console.log('目前没有符合之类排期');
    process.exit();
  }

  if (filterData[0].status === '4') {
    var key = 'guahao' + filterData[0].shiftCaseId;
    var reply = yield thunkify(limitRedis.get).call(limitRedis, key);
    count = reply;
    if (count > 5) {
      process.exit();
    }

    let phone1 = 15997428345;
    let res1 = yield sendMessage(phone1);
    let phone2 = 18611515379;
    let res2 = yield sendMessage(phone2);
    let phone3 = 18979805865;
    let res3 = yield sendMessage(phone3);

    limitRedis.set(key, (++count));
    process.exit();
  } else {
    console.log('目前没有符合之类排期');
    process.exit();
  }
}).catch(err => {
  console.log(err);
});
