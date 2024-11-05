<script setup>
import { appQrcodeAPI, appStatusAPI } from '@/api/session'
import { nextTick, onMounted, onUnmounted, reactive, ref } from 'vue'
import QRCode from 'qrcode'
import { Base64 } from 'js-base64'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
const emits = defineEmits(['closeModal'])
const userStore = useUserStore()
const qrcodeInfo = reactive({
  client_id: '',
  code: '',
  signature: '',
  ts: ''
})
const getQrcodeInfo = async () => {
  const res = await appQrcodeAPI()
  qrcodeInfo.client_id = res.client_id
  qrcodeInfo.code = res.code
  qrcodeInfo.signature = res.signature
  qrcodeInfo.ts = res.ts
  nextTick(() => renderQrcode(qrcodeInfo))
}

const timer = ref(null)
const renderQrcode = (content) => {
  let text = Base64.encode(JSON.stringify(content))
  QRCode.toCanvas(document.getElementById('qrcode'), text, { width: 188, scale: 1, errorCorrectionLevel: 'L' }, function (error) {
    if (error) {
      console.error(error)
      return
    }
    console.log('success!');
    // 轮询查状态
    timer.value = setInterval(getAuthorStatus, 3000)
  })
}

const scanState = ref(0)
const getAuthorStatus = async () => {
  const { state, access_token, refresh_token } = await appStatusAPI(qrcodeInfo.code, qrcodeInfo.client_id, qrcodeInfo.ts)
  switch (state) {
    case '等待扫码':
      scanState.value = 0
      break;
    case '过期':
      scanState.value = 1
      clearInterval(timer.value)
      break;
    case '已扫码':
      scanState.value = 2
      break;
    case '未授权':
      scanState.value = 3
      clearInterval(timer.value)
      break;
    case '已授权':
      scanState.value = 4
      clearInterval(timer.value)
      userStore.updateToken({ access_token, refresh_token })
      userStore.getUserInfo()
      emits('closeModal')
      message.success('登录成功！')
      break;
  }
}

const handleRefresh = () => {
  getQrcodeInfo()
  scanState.value = 0
}

onUnmounted(() => {
  clearInterval(timer.value)
})

onMounted(() => {
  getQrcodeInfo()
})
</script>
<template>
  <div class="appscan">
    <div class="qrcontainer flex justify-center align-center">
      <canvas id="qrcode"></canvas>
      <div v-if="scanState === 2" class="mask flex justify-center align-center">
        <div class="flex-column align-center">
          <img src="@/assets/images/login/icon-success.png" alt="" style="width: 40px;height: 40px;">
          <div style="color: #ffffff;font-size: 15px;margin-top: 12px;">扫码成功</div>
        </div>
      </div>
      <div v-if="[1, 3].includes(scanState)" class="mask flex justify-center align-center">
        <div class="flex-column align-center" @click="handleRefresh">
          <img src="@/assets/images/login/icon-refresh.png" alt="" style="width: 36px;height: 36px;cursor: pointer;">
          <div style="color: #ffffff;font-size: 15px;margin-top: 12px;">刷新二维码</div>
        </div>
      </div>
    </div>
  </div>
</template>



<style lang="less" scoped>
.appscan {
  .qrcontainer {
    width: 218px;
    height: 218px;
    background: url('@/assets/images/login/border-bg.png') no-repeat center;
    background-size: 100%;
    margin: 20px auto;
    position: relative;

    .mask {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.70);
      backdrop-filter: blur(5px);
    }
  }


}
</style>