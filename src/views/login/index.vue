<script setup>
import { computed, ref } from 'vue';
import account from './components/Account.vue'
import appscan from './components/AppScan.vue'
import wechat from './components/Wechat.vue'
import { useNavbarStore } from '@/stores/navbar'
const navbarStore = useNavbarStore()
const current = ref('account')

const bodyStyle = { 'padding': '40px' }

const currentComponent = computed(() => {
    return { 'account': account, 'appscan': appscan, 'wechat': wechat }[current.value]
})

const switchLogin = (comname) => {
    current.value = comname
}
// 关闭弹窗组件
const onCloseModal = () => navbarStore.closeLogin()

</script>
<template>
    <a-modal v-model:visible="navbarStore.showLogin" width="480px" :footer="null" destroyOnClose :bodyStyle="bodyStyle">
        <div class="loginhd">
            <div class="welword">Hi，欢迎登录聆雀Chat AI</div>
            <div class="tip">新用户登录自动注册</div>
        </div>

        <div class="panel flex align-center justify-center">
            <div class="panel-item" :class="{ 'active': current === 'wechat' }" @click="switchLogin('wechat')">微信扫码登录</div>
            <div class="panel-item" :class="{ 'active': current === 'appscan' }" @click="switchLogin('appscan')">App扫码登录
            </div>
            <div class="panel-item" :class="{ 'active': current === 'account' }" @click="switchLogin('account')">手机短信登录
            </div>
        </div>
        <transition name="fade-transform" mode="out-in">
            <component :is="currentComponent" @close-modal="onCloseModal" />
        </transition>
    </a-modal>
</template>

<style lang="less" scoped>
.loginhd {
    text-align: center;
    margin-bottom: 40px;

    .welword {
        font-size: 24px;
        font-weight: 700;
        line-height: 28px;
        margin-bottom: 8px;
    }

    .tip {
        font-size: 14px;
        font-weight: 500;
        color: rgba(0, 0, 0, 0.60);
        line-height: 16px;
        letter-spacing: -0.01px;
    }
}

.panel {
    font-size: 15px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.40);
    line-height: 18px;

    .panel-item {
        box-sizing: border;
        padding: 0 20px;
        border-right: 1px solid rgba(0, 0, 0, 0.20);
        margin-bottom: 24px;
        cursor: pointer;

        &:last-child {
            border-right: none;
        }

        &.active {
            color: #3275f3;
        }
    }
}
</style>