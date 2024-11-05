<script setup name="account">
import { reactive, ref } from 'vue'
import { getSmsAPI } from '@/api/session'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const state = reactive({
    formState: {
        phone: '15272419009',
        captcha: '123456'
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
        await userStore.login(state.formState)
        // 获取用户信息
        await userStore.getUserInfo()
        // 关闭登录弹窗组件
        emits('closeModal')
    } catch (error) {
        console.log(error);
    } finally {
        loading.value = false
    }
}

const emits = defineEmits(['closeModal'])

</script>
<template>
    <div class="account">
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
            <div style="height: 36px;"></div>
            <a-form-item :wrapper-col="{ offset: 0, span: 24 }">
                <a-button class="loginbtn" size="large" :loading="loading" type="primary" block
                    html-type="submit">登录</a-button>
            </a-form-item>
        </a-form>
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
</style>