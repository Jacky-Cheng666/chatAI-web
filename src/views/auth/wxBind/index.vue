<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getSmsAPI, wxBindAPI } from '@/api/session'
import { message } from 'ant-design-vue'
import router from '@/router'
const userStore = useUserStore()
const route = useRoute()
const openid = computed(() => route.query.openid)
const state = reactive({
  formState: {
    phone: '',
    captcha: ''
  },
})
const rules = {
  phone: [{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码' }]
}
const loading = ref(false)
const formRef = ref(null)
const smsLoading = ref(false)
const count = ref(60)
const codeMsg = ref('获取验证码')
const timerId = ref(null)
const disabled = ref(false)
const getCaptcha = async () => {
  try {
    await formRef.value.validateFields(['phone']);
    if (disabled.value) return
    disabled.value = true
    smsLoading.value = true
    await getSmsAPI({ phone: state.formState.phone.trim() })
    message.success('验证码已发送至您的手机！')
    countDown()
  } catch (error) {
    console.log('Failed:', error);
    disabled.value = false
  } finally {
    smsLoading.value = false
  }
}
const countDown = () => {
  timerId.value = setInterval(() => {
    count.value--
    codeMsg.value = `还剩${count.value}秒`
    if (count.value <= 0) {
      clearInterval(timerId.value)
      count.value = 60
      codeMsg.value = '重新获取'
      disabled.value = false
    }
  }, 1000);
}
const onFinish = async () => {
  try {
    loading.value = true
    const { access_token, refresh_token } = await wxBindAPI(openid.value, state.formState.phone.trim(), state.formState.captcha.trim())
    userStore.updateToken({ access_token, refresh_token })
    userStore.getUserInfo()
    router.replace('/')
  } catch (error) {
    console.log(error);
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <div class="topbar">
      <RouterLink to="/">
        <img class="logo" src="@/assets/images/auth/topbar.png" alt="">
      </RouterLink>
    </div>
    <div class="content flex align-center justify-center">
      <div class="content-l">
        <div class="flex align-end">
          <div class="icon flex-column align-center">
            <img src="@/assets/images/auth/wechat.png" alt="">
            <div>微信</div>
          </div>
          <img class="switch" src="@/assets/images/auth/switch.png" alt="">
          <div class="icon flex-column align-center">
            <img src="@/assets/images/auth/logo.png" alt="">
            <div style="color: #3275F3;">聆雀Chat AI</div>
          </div>
        </div>
        <div class="text">
          已有聆雀chat AI账号？<br />输入账号信息登录立即绑定
        </div>
      </div>
      <div class="middle-line"></div>
      <div class="content-r">
        <a-form ref="formRef" :model="state.formState" name="basic" autocomplete="off" :rules="rules" @finish="onFinish">
          <a-form-item name="phone">
            <a-input allowClear :maxlength="11" type="text" size="large" v-model:value="state.formState.phone"
              placeholder="请输入手机号码" />
          </a-form-item>
          <a-form-item name="captcha">
            <a-input :allowClear="false" :maxlength="6" type="text" size="large" v-model:value="state.formState.captcha"
              placeholder="请输入验证码" />
            <a-button class="smsbutton" type="link" :loading="smsLoading" :disabled="disabled" @click="getCaptcha">{{
              codeMsg }}</a-button>
          </a-form-item>
          <a-form-item :wrapper-col="{ offset: 0, span: 24 }">
            <a-button class="loginbtn" size="large" :loading="loading" type="primary" block
              html-type="submit">授权并登录/注册</a-button>
            <div class="desc">未注册绑定的手机号验证成功后将自动注册</div>
          </a-form-item>
        </a-form>

      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.container {
  .topbar {
    height: 160px;
    overflow: hidden;
    margin-bottom: 120px;

    .logo {
      height: 160px;
    }
  }

  .content {
    height: 400px;

    .content-l {

      .icon {
        font-size: 15px;
        font-weight: 500;
        color: #00c250;
        line-height: 24px;

        &>img {
          width: 80px;
          height: 80px;
          margin-bottom: 20px;
        }
      }

      .switch {
        width: 62px;
        height: 26px;
        margin: 0 70px 50px;
      }

      .text {
        margin-top: 30px;
        font-size: 17px;
        font-weight: 500;
        line-height: 26px;
        text-align: center;
      }
    }

    .middle-line {
      width: 2px;
      height: 234px;
      opacity: 0.15;
      border: 1px solid #000000;
      margin: 0 100px;
    }

    .content-r {
      width: 360px;

      ::v-deep(.ant-input-affix-wrapper-lg) {
        height: 50px;
        padding: 0 16px;
        font-size: 17px;
        background: rgba(0, 0, 0, 0.03);
      }

      ::v-deep(.ant-input-affix-wrapper > input.ant-input) {
        background: unset;
      }

      .loginbtn {
        height: 50px;
        border-radius: 6px;
        background: linear-gradient(89deg, #3941ff 0%, #3988ff 100%);
      }

      .smsbutton {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: 0;
        z-index: 1;
      }

      .desc {
        margin-top: 12px;
        text-align: center;
        font-size: 13px;
        color: rgba(0, 0, 0, 0.40);
      }
    }
  }
}
</style>