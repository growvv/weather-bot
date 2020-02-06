'use strict';

const nodemailer = require('nodemailer');
const request=require('request');

const url= 'https://free-api.heweather.net/s6/weather/forecast?location=112.3796463,26.96238708&key=8860c7c427cd474da69bd56c89e6d116';

request(url,(error,response,body)=>{
    console.log(body)
    var data=JSON.parse(body);
    data=data.HeWeather6[0];
    console.log(data)

    let transporter = nodemailer.createTransport({
  // host: 'smtp.ethereal.email',
  service: 'qq', // 使用了内置传输发送邮件 查看支持列表：https://nodemailer.com/smtp/well-known/
  port: 465, // SMTP 端口
  secureConnection: true, // 使用了 SSL
  auth: {
    user: 'growvv@qq.com',
    // 这里密码不是qq密码，是你设置的smtp授权码，去qq邮箱后台开通、查看
    pass: 'yhhhsqnxakllbdjd',
  }
});

let mailOptions = {
  from: '"预报君" <growvv@qq.com>', // sender address
  to: '2092876368@qq.com', // list of receivers
  subject: data.daily_forecast[0].date + 'の天気', // Subject line
  // 发送text或者html格式
  text:'城市 :'+data.basic.location+'时间：'+ data.daily_forecast[0].date,
  html: '<div><div><h1>快快起床</h1></div><div><h3 style="margin:20px auto 10px auto">' + data.daily_forecast[0].date + ' ' + data.basic.location + '区</h3><div><p><span>日出时间: </span><span>'+data.daily_forecast[0].sr+'</span><span style="width:40%;margin-left: 30px">日落时间: </span><span>'+data.daily_forecast[0].ss+'</span></p><p><span>白天: </span><span>'+data.daily_forecast[0].cond_txt_d+'</span><span style="width:40%;margin-left: 30px">晚间: </span><span>'+data.daily_forecast[0].cond_txt_n+'</span></p><p><span>最高温度: </span><span><b>'+data.daily_forecast[0].tmp_max+'</b>℃</span><span style="width:40%;margin-left: 30px">最低温度: </span><span><b>'+data.daily_forecast[0].tmp_min+'</b>℃</span></p><p><span>紫外线强度指数: </span><span><b>'+data.daily_forecast[0].uv_index+'</b></span></p><p><span>降水概率: </span><span>'+data.daily_forecast[0].pop+' %</span></p><p><span>风力: </span><span>'+data.daily_forecast[0].wind_sc+'</span></p><br><p><small>注 紫外线强度: 0-2 无危险 | 3-5 较轻伤害 | 6-7 很大伤害 | 8-10 极高伤害 | 11+ 及其危险</small></p><p><small>更新时间：' +  data.update.loc + '</small></p></div></div></div>'
};

// send mail with defined transport object
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    return console.log(error);
  }

  console.log(info)
});
})

