# Weather-Bot
一个利用GitHub Actions自动发送天气到邮箱的Bot.

注：index2.js是另外一个邮件模板（调用的和风天气），index.html是一个网页版天气插件

## 一、workflow编写
**触发机制**
```yml
on:
  push:
  schedule:
    - cron: '0 21 * * *'
```
**node环境及运行**
```yml
    - name: Setup Node
      uses: actions/setup-node@v1
      with:
        node-version: '10.x'
        
    - name: 'Install NPM dependencies'
      run: 
        npm install nodemailer
        npm install request superagent cheerio dotenv-extended art-template node-schedule
        
    - name: Run
      run: node index.js
      env:
        SMTP: ${{secrets.SMTP}}
```

## 二、天气获取
爬取墨迹天气
```js
function getMojiData() {
    return new Promise((resolve, reject) => {
        request
            .get("https://tianqi.moji.com/weather/china/guangdong/guangzhou")
            .end((err, res) => {
                if (err) return console.log("数据请求失败，请检查路径");
                // console.log(res.text);
                // 把字符串解析成THML，并可用 jQuery 核心选择器获取内容
                const $ = cheerio.load(res.text);
                // 图标
                const icon = $(".wea_weather span img").attr("src");
                // 天气
                const weather = $(".wea_weather b").text();
                // 温度
                const temperature = $(".wea_weather em").text();
                // 提示
                const tips = $(".wea_tips em").text();
                // 墨迹天气数据
                const mojiData = {
                    icon,
                    weather,
                    temperature,
                    tips
                };
                // console.log(mojiData);
                resolve(mojiData);
            });
    });
}
```

## 三、获取one
可选，获取一张图片和一句话。

也是通过爬虫的方式
```js
// 3.1 请求 One 页面抓取数据
function getOneData() {
    return new Promise((resolve, reject) => {
        request.get("http://wufazhuce.com/").end((err, res) => {
            if (err) return console.log("请求失败");

            // 把返回值中的页面解析成 HTML
            const $ = cheerio.load(res.text);
            // 抓取 one 的图片
            const img = $(
                ".carousel-inner>.item>img, .carousel-inner>.item>a>img"
            )
                .eq(0)
                .attr("src");
            // 抓取 one 的文本
            const text = $(".fp-one .fp-one-cita-wrapper .fp-one-cita a")
                .eq(0)
                .text();
            // one 数据
            const oneData = {
                img,
                text
            };
            // console.log(oneData);
            resolve(oneData);
        });
    });
}
```

## 四、编写邮件模板
```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>爱的邮件</title>
    </head>
    <body style="margin:0;padding:0;">
        <div style="text-align:center;margin:35px 0;">
            <span style="display:block;margin-top:25px;font-size:22px; color:#9d9d9d; ">
            {{dayData.format}}
            </span>
        </div>
        <div style="width:100%; margin: 0 auto;color:#5f5e5e;text-align:center">
            <img
                style="background: #0097e0"
                src={{mojiData.icon}}
                alt="天气图标"
            />
            <b style="display:block;color:#333;font-size:24px;margin:15px 0;"
                >天气：{{mojiData.weather}}</b
            >
            <b style="display:block;color:#333;font-size:24px;margin:15px 0;"
                >温度：{{mojiData.temperature}}</b
            >
            <b style="display:block;color:#333;font-size:24px;margin:15px 0;"
                >适宜：{{mojiData.activity}}</b
            >

            <span style="display:block;color:#676767;font-size:20px"
                >提示：{{mojiData.tips}}</span
            >
            <span style="display:block;color:#676767;font-size:20px"
                >地点：{{mojiData.addr}}</span
            >
            <span style="display:block;color:#676767;font-size:20px"
                >{{mojiData.uptime}}</span
            >
        </div>
        <div style="text-align:center;margin:35px 0;">
            <img
                src={{oneData.img}}
                style="width:100%;margin-top:10px;"
                alt="ONE配图"
            />
            <div style="margin:10px auto;width:85%;color:#5f5e5e;">
                {{oneData.text}}
            </div>
        </div>
    </body>
</html>

```

## 五、模板引擎的替换
以html格式发送邮件，所以需要先编写一个html文件。为了动态更新，采用数据替换的方式。

用到art-template这个库。用法见其[官方文档](https://aui.github.io/art-template/zh-cn/docs/index.html)。

```js
//  通过模板引起替换 HTML 的数据
async function renderTemplate() {
    // 获取 日期
    const dayData = await getDayData();
    // 获取 墨迹天气数据
    const mojiData = await getMojiData();
    // 获取 One 的数据
    const oneData = await getOneData();
    //console.log(dayData);
    //console.log(mojiData);
    //console.log(oneData);
    // 所有数据都获取成功的时候，才进行模板引擎数据的替换
    return new Promise((resolve, reject) => {
        const html = template(path.join(__dirname, "./weather.html"), {
            dayData,
            mojiData,
            oneData
        });
        //console.log(html);
        resolve(html);
    });
}
```

## 六、有待改进
1. 邮箱的SMTP码应该藏起来

已改进，使用actions的env并将SMTP存在项目的secrets中。

2. 写一个好看的邮件模板

CSS功底太差，这个模板都是网上找的。

## 参考链接
1. [知乎-利用模版引擎制作HTML的邮件](https://zhuanlan.zhihu.com/p/62199733)
2. [知乎-如何制作网页格式的邮件（html）邮件？](https://www.zhihu.com/question/20556280)
