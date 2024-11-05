<script setup>
import { onMounted } from 'vue';

onMounted(() => {
})
</script>
<template>
  <div class="container flex-column">
    <div class="header">
      <div class="tabpanel">
        <RouterLink class="item" active-class="active" to="/community/find">发现AI机器人</RouterLink>
        <RouterLink class="item" active-class="active" to="/community/my">我的AI机器人</RouterLink>
      </div>
    </div>
    <div class="flex-1 scroller">
      <RouterView />
    </div>

  </div>
</template>



<style lang="less" scoped>
.container {
  box-sizing: border-box;
  margin: 0 auto;
  height: 100%;

  .header {
    margin-top: 40px;
    margin-bottom: 46px;

    .tabpanel {
      .item {
        font-size: 15px;
        font-weight: 700;
        color: rgba(0, 0, 0, 0.40);
        line-height: 18px;
        margin-right: 40px;
      }

      .active {
        font-size: 20px;
        color: #000000;
        position: relative;

        &::after {
          content: '';
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 32px;
          height: 4px;
          background: #3275f3;
          border-radius: 2px;
        }

      }
    }
  }

  .scroller {
    overflow-y: auto;
  }
}

@media screen and (max-width:1439px) {
  .container {
    width: 851px;
  }
}

@media screen and (max-width: 1679px) and (min-width: 1440px) {
  .container {
    width: 911px;

  }
}

@media screen and (max-width:1919px) and (min-width: 1680px) {
  .container {
    width: 1104px;

  }
}

@media screen and (min-width: 1920px) {
  .container {
    width: 1464px;
  }

}
</style>