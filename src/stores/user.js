import { defineStore } from 'pinia'
import avatar from '@/assets/images/user/user-avatar.png'
import { loginAPI, userinfoAPI, reauthAPI, wxloginAPI } from '@/api/session'
export const useUserStore = defineStore('user', {
  state: () => ({
    userInfos: {
      phone: '',//手机号
      avatar: avatar, //头像
      isTrial: 0, //是否是体验用户  1:体验用户   0：非体验用户
      expires: '',//会员到期时间
      isValid: false,  //账号状态是否正常
      userId: '',
      count: 0, //剩余可使用对话次数
      modelId: '',
      modelName: '',
      docCount: '',
      isBindWx: false,
      nickname: '',
      overDays: 0 //过期多少天
    },
    token: {
      access_token: '',
      refresh_token: ''
    }
  }),
  actions: {
    // 短信登录
    async login(userInfo) {
      const { access_token, refresh_token } = await loginAPI(userInfo)
      this.token.access_token = access_token
      this.token.refresh_token = refresh_token
    },
    // 获取用户信息
    async getUserInfo() {
      const res = await userinfoAPI()
      this.userInfos.phone = res.phone
      this.userInfos.isTrial = res.isTrial
      this.userInfos.expires = res.expires
      this.userInfos.isValid = res.isValid
      this.userInfos.userId = res.userId
      this.userInfos.count = res.trialCount
      this.userInfos.modelId = res.modelId
      this.userInfos.modelName = res.modelName
      this.userInfos.docCount = res.docCount
      this.userInfos.isBindWx = res.bind_wx_login
      this.userInfos.nickname = res.nickname
      this.userInfos.overDays = res.daysOfOverdue
    },
    // 更新token信息
    updateToken(token) {
      this.token.access_token = token.access_token
      this.token.refresh_token = token.refresh_token
    },
    // 自动续期token
    async refreshToken() {
      const { access_token, refresh_token } = await reauthAPI({ refresh_token: this.token.refresh_token })
      this.updateToken({ access_token, refresh_token })
    },
    // 更新文档上传次数
    changeDocTimes(value) {
      this.userInfos.docCount = value
    },
    clear() {
      this.userInfos = {}
      this.token = {}
    },
    // 微信扫码登录
    async wxLogin(code) {
      const { access_token, refresh_token } = await wxloginAPI(code)
      this.token.access_token = access_token
      this.token.refresh_token = refresh_token
    }
  },
  getters: {
    accessToken() {
      return this.token.access_token
    },
    isLogin() {
      return Boolean(this.token.access_token && this.token.refresh_token)
    },
    // 是否体验用户
    isExperience() {
      return this.userInfos.isTrial === 1
    },
    // vip是否有效
    validVip() {
      return this.userInfos.isTrial === 0 && this.userInfos.isValid
    },
    // vip是否过期
    invalidVip() {
      return this.userInfos.isTrial === 0 && !this.userInfos.isValid
    }
  },
  persist: true
})