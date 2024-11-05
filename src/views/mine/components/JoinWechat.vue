<script setup>
import { ref } from 'vue'
const visible = ref(false)
const openModal = () => visible.value = true
defineExpose({ openModal })
</script>

<template>
  <a-modal v-model:visible="visible" centered title="加入微信群聊" :footer="null" @cancel="visible = false">
    <div class="qrcode">
      <img src="@/assets/images/mine/qrcode.png" alt="">
    </div>
    <div class="text">扫码加入微信群聊，和大家一起探索AI的无尽可能吧</div>
  </a-modal>
</template>

<style lang="less" scoped>
.qrcode {
  width: 200px;
  height: 200px;
  margin: 0 auto;

  &>img {
    width: 100%;
    height: 100%;
  }
}

.text {
  width: 344px;
  margin: 40px auto 20px;
}
</style>