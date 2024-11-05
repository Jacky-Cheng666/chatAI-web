<script setup>
import { ref } from 'vue'
const visible = ref(false)
const openModal = () => visible.value = true
import clip from '@/utils/clipboard'


const handleCopy = (event, text) => clip(text, event)
defineExpose({ openModal })
</script>

<template>
  <a-modal v-model:visible="visible" centered title="意见反馈" :footer="null" @cancel="visible = false">
    <div class="qrcode">
      <img src="@/assets/images/mine/feedback-qrcode.png" alt="">
    </div>
    <div class="text">欢迎加入专属客服群，专属客服服务，沟通更便捷</div>
    <div class="row flex align-center justify-between">
      <div class="col">企业邮箱：support@eyuai.com</div>
      <div class="copy" @click="handleCopy($event, 'support@eyuai.com')">
        <img src="@/assets/images/mine/icon-copy.png" alt="">
      </div>
    </div>
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
  width: 330px;
  margin: 24px auto;
}

.row {
  margin: 0 auto;
  width: 280px;
  height: 36px;
  border: 1px solid #3275f3;
  border-radius: 8px;
  padding: 8px 12px;
  box-sizing: border-box;
  font-size: 13px;
  color: #000000;
  line-height: 20px;

  .copy {
    cursor: pointer;

    img {
      width: 16px;
      height: 16px;
    }
  }
}
</style>