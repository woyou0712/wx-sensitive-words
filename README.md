# 使用微信小程序的敏感词过滤机制

- 市面上敏感词过滤的库都有限制，包括微信小程序的也有一定限制，本库只能在一定程度上弱化限制，无法完全避免失败的情况。

## 安装

```
npm i -S wx-sensitive-words
```

## 使用

```javascript
const WX = require("wx-sensitive-words");
const sensitiveWords = new WX("appid", "secret");
// 建议此方法在用户打开小程序时调用，获取用户openid，WX类会保留最后一次获取到的openid
sensitiveWords.getOpenid("小程序code");
// 检查是否包含敏感词,第二个参数为两小时内进入过小程序的用户openid，如果两小时内调用过`getOpenid`方法，则无需传入此参数
sensitiveWords.sensitiveWords("敏感词", "openid").then(({ bool, message }) => {
  if (bool) {
    // 包含敏感词
  } else {
    // 不包含敏感词
  }
});
```
