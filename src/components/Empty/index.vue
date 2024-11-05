<script setup>
defineProps({
  text: {
    type: String,
    default: '暂无数据~'
  }
})
</script>
<template>
  <div class="empty flex-column align-center">
    <img class="icon" src="@/assets/images/community/empty.png" alt="">
    <div class="text">{{ text }}</div>
  </div>
</template>



<style lang="less" scoped>
.empty {
  .icon {
    width: 120px;
    height: 120px;
    margin-bottom: 20px;
  }

  .text {
    font-size: 13px;
    color: rgba(0, 0, 0, 0.60);
    line-height: 20px;
    width: 234px;
    text-align: center;
  }
}
</style>