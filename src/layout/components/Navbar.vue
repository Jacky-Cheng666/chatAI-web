<script setup>
import Login from '@/views/login/index.vue'
import { useUserStore } from '@/stores/user'
import { useNavbarStore } from '@/stores/navbar'
import { useSidebarStore } from '@/stores/sidebar'
const userStore = useUserStore()
const navbarStore = useNavbarStore()
const sidebarStore = useSidebarStore()

const login = () => {
    navbarStore.openLogin()
}
</script>
<template>
    <div class="navbar flex align-center">
        <RouterLink active-class="active" class="routerlink" to="/welcome">AI聊天</RouterLink>
        <RouterLink active-class="active" class="routerlink" to="/community">AI广场</RouterLink>
        <RouterLink active-class="active" class="routerlink" to="/upload">文案分析</RouterLink>

        <div class="userinfo mlauto">
            <!-- 已登录 -->
            <template v-if="userStore.isLogin">
                <div class="flex align-center">
                    <RouterLink class="flex align-center" to="/mine">
                        <div class="avatar">
                            <img :src="userStore.userInfos.avatar" alt="">
                        </div>
                        <div class="phone">{{ userStore.userInfos.phone }}</div>
                    </RouterLink>
                    <div class="tag" @click="sidebarStore.openPriceModal()">
                        <img v-if="userStore.validVip" class="valid" src="@/assets/images/navbar/valid.png" alt="">
                        <img v-if="userStore.invalidVip" class="invalid" src="@/assets/images/navbar/invalid.png" alt="">
                    </div>
                </div>
            </template>
            <!-- 未登录 -->
            <template v-else>
                <a-button size="default" type="primary" @click="login">登录</a-button>
            </template>

        </div>
    </div>

    <Login />
</template>


<style lang="less" scoped>
.navbar {
    height: 54px;
    background: #e8ebf1;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    padding: 0 20px;
    box-sizing: border-box;

    .routerlink {
        font-size: 15px;
        margin: 0 25px;
        color: #000000;

        &.active {
            font-weight: 700;
            color: #3275f3;
        }
    }

    .userinfo {
        .avatar {
            &>img {
                width: 28px;
                height: 28px;
                border-radius: 8px;
            }
        }

        .phone {
            font-size: 13px;
            color: #000000;
            line-height: 15px;
            margin-left: 4px;
        }

        .tag {
            margin-left: 20px;
            cursor: pointer;

            .valid {
                width: 80px;
                height: 26px;
            }

            .invalid {
                width: 88px;
                height: 26px;
            }
        }
    }
}
</style>