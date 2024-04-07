const axios = require("axios");

const labelMap = {
  100: "正常",
  10001: "广告",
  20001: "时政",
  20002: "色情",
  20003: "辱骂",
  20006: "违法犯罪",
  20008: "欺诈",
  20012: "低俗",
  20013: "版权",
  21000: "其他",
};

class WX {
  appid = null;
  secret = null;
  openid = "";
  accessToken = {
    access_token: "",
    endTime: 0,
  };
  constructor(appid, secret) {
    this.appid = appid;
    this.secret = secret;
  }

  // 获取access_token
  getAccessToken() {
    return new Promise((resolve, reject) => {
      if (this.accessToken.endTime > Date.now()) {
        resolve(this.accessToken.access_token);
        return;
      }
      axios
        .get(
          `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appid}&secret=${this.secret}`
        )
        .then(({ data }) => {
          this.accessToken.access_token = data.access_token;
          this.accessToken.endTime = Date.now() + data.expires_in;
          resolve(this.accessToken.access_token);
        })
        .catch((err) => reject(err));
    });
  }

  // 获取用户openid
  getOpenid(code) {
    return new Promise(async (resolve, reject) => {
      axios
        .get(
          `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appid}&secret=${this.secret}&js_code=${code}&grant_type=authorization_code`
        )
        .then(({ data }) => {
          if (data.openid) {
            this.openid = data.openid;
            resolve(data.openid);
            return;
          }
          reject(data);
        })
        .catch((err) => reject(err));
    });
  }

  /**
   * 敏感词检测
   * @param {String} content 需检测的文本内容，文本字数的上限为2500字，需使用UTF-8编码
   * @param {String} openid 小程序用户的openId，需要两小时进入过小程序的
   * @returns
   */
  checkout(content, openid = this.openid, scene = 2) {
    return new Promise(async (resolve, reject) => {
      if (!openid) {
        reject("not openid");
        return;
      }
      const access_token = await this.getAccessToken();
      axios
        .post(
          `https://api.weixin.qq.com/wxa/msg_sec_check?access_token=${access_token}`,
          {
            content,
            openid,
            scene,
            version: 2,
          }
        )
        .then(({ data }) => {
          const result = data?.detail || [];
          const value = result.find((item) => item.label);
          if (value.label === 100) {
            resolve({ bool: false, message: "未包含敏感词" });
            return;
          }
          resolve({ bool: true, message: labelMap[value.label] });
        })
        .catch((err) => reject(err));
    });
  }
  /**
   * 获取小程序二维码
   * @param {String} path
   * @param {String} scene
   * @param {{env_version:string;width:number;auto_color:boolean;line_color:{r:number;g:number;b:number}}} data
   * @returns {Promise<buffer>}
   */
  getWxacodeunlimit(page, scene, data = {}) {
    return new Promise(async (resolve, reject) => {
      if (!page || !scene) {
        reject("page or scene is null");
        return;
      }
      const access_token = await this.getAccessToken();
      axios
        .post(
          `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${access_token}`,
          { page, scene, ...data },{ responseType: 'arraybuffer'}
        )
        .then(({ data }) => {
          const res = data.toString()
          if (res.indexOf("errmsg")>=0) {
            reject(JSON.parse(res).errmsg);
            return;
          }
          resolve(data);
        })
        .catch((e) => reject(e));
    });
  }
}

module.exports = WX;
