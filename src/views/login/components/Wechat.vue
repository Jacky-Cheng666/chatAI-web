
<script setup>
import { computed, onMounted } from 'vue'

const host = computed(() => import.meta.env.VITE_APP_HOST)
const baseUrl = computed(() => import.meta.env.VITE_API_URL)

const renderQrcode = () => {
  new WxLogin({
    self_redirect: false,
    id: "qrcode",
    appid: "wx5a21baeac709f546",
    scope: "snsapi_login",
    redirect_uri: host.value + '/wxlogin',
    state: +new Date(),
    style: "black",
    href: `${baseUrl.value}/api/wxCode.css`
  });
}
onMounted(renderQrcode)
</script>

<template>
  <div id="qrcode"></div>
</template>

<style lang="less" scoped>
#qrcode {
  margin: 20px auto 0;
  width: 218px;
  height: 300px;
  background: url('@/assets/images/login/border-bg.png') no-repeat top;
  background-size: 218px 218px;
}
</style>