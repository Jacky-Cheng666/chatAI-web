<script setup>
import zhCN from 'ant-design-vue/es/locale/zh_CN'
</script>
<template>
  <a-config-provider :locale="zhCN" componentSize="default">
    <RouterView />
  </a-config-provider>
</template>
