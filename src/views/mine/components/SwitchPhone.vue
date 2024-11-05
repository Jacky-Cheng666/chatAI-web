<script setup>
import { ref, reactive } from 'vue'
import { getSmsAPI, switchPhoneAPI } from '@/api/session'
import { message } from 'ant-design-vue'
const visible = ref(false)

const openModal = () => visible.value = true
const rules = {
  phone: [{ required: true, message: '请输入手机号' }, { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
  captcha: [{ required: true, message: '请输入验证码' }]
}
const formState = reactive({
  phone: '',
  captcha: ''
})
const loading = ref(false)
const smsLoading = ref(false)
const disabled = ref(false)
const codeMsg = ref('获取验证码')

const formRef = ref(null)

const getCaptcha = async () => {
  try {
    await formRef.value.validateFields(['phone']);
    if (disabled.value) return
    disabled.value = true
    smsLoading.value = true
    await getSmsAPI({ phone: formState.phone.trim() })

    message.success('验证码已发送至您的手机！')
    countDown()
  } catch (error) {
    console.log('Failed:', error);
    disabled.value = false
  } finally {
    smsLoading.value = false
  }
}
const timerId = ref(null)
const count = ref(60)
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
    await switchPhoneAPI(formState)
    message.success('更换成功')
    formRef.value.resetFields()
    visible.value = false
  } catch (error) {
    console.log('error');
  } finally {
    loading.value = false

  }
}

const onCancel = () => {
  disabled.value = false
  count.value = 60
  codeMsg.value = '获取验证码'
  clearInterval(timerId.value)
  formRef.value.resetFields()
}

defineExpose({ openModal })
</script>

<template>
  <div class="switch-phone">
    <a-modal v-model:visible="visible" title="更换手机号" :footer="null" @cancel="onCancel">
      <a-form ref="formRef" :model="formState" name="basic" autocomplete="off" :rules="rules" @finish="onFinish">
        <a-form-item name="phone" :wrapperCol="{ offset: 3, span: 18 }">
          <a-input allowClear :maxlength="11" type="text" size="large" v-model:value="formState.phone"
            placeholder="请输入手机号码" style="width: 360px;height: 40px;" />
        </a-form-item>
        <a-form-item name="captcha" :wrapperCol="{ offset: 3, span: 18 }">
          <a-input :allowClear="false" :maxlength="6" type="text" size="large" v-model:value="formState.captcha"
            placeholder="请输入验证码" style="width: 360px;height: 40px;" />
          <a-button class="smsbutton" type="link" :loading="smsLoading" :disabled="disabled" @click="getCaptcha">{{
            codeMsg }}</a-button>
        </a-form-item>
        <div style="height: 16px;"></div>
        <a-form-item :wrapper-col="{ offset: 3, span: 18 }">
          <a-button class="loginbtn" size="large" :loading="loading" type="primary" block html-type="submit">确定</a-button>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
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
  width: 360px;
  height: 40px;
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
</style>