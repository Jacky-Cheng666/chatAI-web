import request from '@/utils/request'
const appType = import.meta.env.VITE_APP_TYPE
/**
 * @description 获取短信验证码
 * @param {string} phone 手机号 
 */
export function getSmsAPI({ phone }) {
  return request({
    url: `/api/${appType}/user/login/captcha`,
    method: 'post',
    data: { phone }
  })
}
/**
 * @description 手机号短信登录
 * @param {string} phone 手机号
 * @param {string} captcha 验证码
 */
export function loginAPI({ phone, captcha }) {
  return request({
    url: `/api/${appType}/user/login/phonenum`,
    method: 'post',
    data: { phone, captcha }
  })
}

/**
 * @description 获取用户信息
 */
export function userinfoAPI() {
  return request({
    url: `/api/${appType}/user/info`,
    method: 'get'
  })
}

/**
 * @description 重刷token
 * @param {string} refresh_token 兑换新的access_token需要用到的参数 
 * @returns 
 */
export function reauthAPI({ refresh_token }) {
  return request({
    url: `/api/${appType}/user/reauth`,
    method: 'put',
    data: { refresh_token }
  })
}
/**
 * @description 退出登录
 */
export function logoutAPI() {
  return request({
    url: `/api/${appType}/user/logout`,
    method: 'post'
  })
}

/**
 * 
 * @param {string} phone 手机号
 * @param {string} captcha 短信验证码
 */
export function switchPhoneAPI({ phone, captcha }) {
  return request({
    url: `api/${appType}/user/phone`,
    method: 'put',
    data: { phone, captcha }
  })
}

/**
 * @description 解绑微信
 */
export function unbindWxAPI() {
  return request({
    url: '/api/web/bind/wechat',
    method: 'delete'
  })
}

/**
 * 绑定微信
 * @param {string} code 微信授权临时code 
 */
export function bindWxAPI(code) {
  return request({
    url: `/api/${appType}/bind/wechat`,
    method: 'post',
    data: { code }
  })
}

/**
 * @description 获取AI模型列表
 */
export function modelListAPI() {
  return request({
    url: `/api/${appType}/user/models`,
    method: 'get'
  })
}

/**
 * @description 切换AI模型
 * @param {number} model 模型id
 * @param {string} key openai key
 */
export function changeModelAPI(model, key) {
  return request({
    url: `/api/${appType}/user/models`,
    method: 'put',
    data: { model, key }
  })
}

/**
 * @description 兑换会员
 * @param {string} cdkey 用于兑换会员的key
 */
export function exchangeAPI(cdkey) {
  return request({
    url: `/api/${appType}/rights/cdkey`,
    method: 'post',
    data: { cdkey }
  })
}

/**
 * @description cdk兑换记录
 */
export function cdkRecordsAPI() {
  return request({
    url: `/api/${appType}/rights/cdkey`,
    method: 'get',
  })
}

/**
 * @description 会员充值记录
 */
export function rechargeListAPI() {
  return request({
    url: `/api/${appType}/rights/recharge`,
    method: 'get',
  })
}

/**
 * @description 获取app二维码
 */
export function appQrcodeAPI() {
  return request({
    url: `/api/${appType}/login/scan/qrcode`,
    method: 'get',
  })
}

/**
 * @description 查询app扫码授权状态
 * @param {string} code 
 * @param {string} client_id 
 * @param {Date} ts 
 */
export function appStatusAPI(code, client_id, ts) {
  return request({
    url: `/api/${appType}/login/scan/qrcode/state`,
    method: 'get',
    params: { code, client_id, ts }
  })
}

/**
 * @description 微信扫码登录
 * @param {string} code 微信临时授权code
 */
export function wxloginAPI(code) {
  return request({
    url: `/api/${appType}/login/scan/code`,
    method: 'get',
    params: { code }
  })
}

/**
 * @description 微信绑定手机号(登录)
 * @param {string} openid 微信openid
 * @param {string} phone  手机号
 * @param {string} captcha 验证码
 */
export function wxBindAPI(openid, phone, captcha) {
  return request({
    url: `/api/${appType}/login/scan/bind`,
    method: 'post',
    data: { openid, phone, captcha }
  })
}