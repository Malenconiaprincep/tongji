var koa = require('koa');
var request = require('request');
var thunkify = require('thunkify');
var co = require('co');
var fs = require('fs');
var config = require('./config.js')
var headers = config.headers
var cookie_h_i = config.cookie_h_i

function* getConfig(checkcode) {
  let config = yield thunkify(fs.readFile)('config.json','utf8');

  config = config.replace('******', checkcode)

  // console.log(config)
  return config;
}

function* getSubmit(config) {
  // console.log(typeof(config))
  var j = request.jar();
  var url = 'http://app.tjh.com.cn/my/submitorder/dosubmit'
  var cookie = request.cookie('_h_i__=' + cookie_h_i);

  j.setCookie(cookie, url);
  let res = yield thunkify(request)({
    url,
    method: 'POST',
    jar: j,
    headers: headers,
    json: JSON.parse(config)
  })

  // console.log(j.getCookies(url))

  res = res[0];
  console.log(res)
  var data = res.body;
  // console.log(data)
  return data
}



co(function*() {
  var arguments = process.argv.splice(2);
  arguments = arguments[0]
  let config = yield getConfig(arguments)


  // console.log(config)
  let submit = yield getSubmit(config)
  // console.log(submit)
}).catch(err => {
  console.log(err);
});
