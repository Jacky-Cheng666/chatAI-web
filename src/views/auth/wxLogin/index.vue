
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { onMounted } from 'vue';
const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const handleLogin = async () => {
  try {
    await userStore.wxLogin(route.query.code)
    await userStore.getUserInfo()
    router.replace('/')
  } catch (error) {
    const res = error.response.data
    if (res.errcode === '43000') {
      router.replace('/wxbind?openid=' + res.wx_login_openid)
    } else {
      // 其他微信扫码错误情况
      router.replace('/')
    }
  }
}
onMounted(() => {
  if (route.query.code) {
    handleLogin()
  } else {
    router.replace('/')
  }
})
</script>
<template>
  <div>正在登录中...请稍后</div>
</template>


<style lang="less" scoped></style>