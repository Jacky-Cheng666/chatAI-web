<script setup>
import iconAdd from '@/assets/images/sidebar/icon-add.png'
import iconEarth from '@/assets/images/sidebar/icon-earth.png'
import { useSidebarStore } from '@/stores/sidebar'
import { computed, watch, createVNode, ref, reactive, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { delSessionAPI, delFileAPI } from '@/api/sidebar'
import { Modal, message } from 'ant-design-vue'
import { ExclamationCircleOutlined, SearchOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import { useNavbarStore } from '@/stores/navbar'
import moment from 'moment'
const route = useRoute()
const router = useRouter()
const sidebarStore = useSidebarStore()
const userStore = useUserStore()
const navbarStore = useNavbarStore()
const menus = [
    { name: '创建AI', icon: iconAdd, path: '/community/my' },
    { name: '发现AI', icon: iconEarth, path: '/community' },
]
const baseurl = computed(() => import.meta.env.VITE_API_URL)

const chatId = computed(() => route.params.id)

const loading = ref(false)

watch(chatId, (id) => {
    const ele = document.getElementById(id)
    if (ele) {
        ele.scrollIntoView({ block: 'start', behavior: 'smooth' })
    }
})

watch(() => userStore.isLogin, async (logged) => {
    if (logged) {
        loading.value = true
        await sidebarStore.getSessions()
        loading.value = false
    }

}, { immediate: true })

const onHandleDelete = (presetId) => {
    if (!flag.value) {
        Modal.confirm({
            title: '提示',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认是否要从我的会话列表中删除这个机器人？',
            okText: '确认',
            okType: 'primary',
            cancelText: '取消',
            centered: true,
            async onOk() {
                try {
                    await delSessionAPI({ presetId })
                    message.success('会话已删除')
                    sidebarStore.getSessions()
                    router.replace('/welcome')
                } catch {
                    console.log('delete error!')
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        })
    } else {
        Modal.confirm({
            title: '提示',
            icon: createVNode(ExclamationCircleOutlined),
            content: '确认是否要删除该文件？',
            okText: '确认',
            okType: 'primary',
            cancelText: '取消',
            centered: true,
            async onOk() {
                try {
                    await delFileAPI(presetId)
                    message.success('文件已删除')
                    sidebarStore.getRecentFileList(queryParams)
                    userStore.changeDocTimes(userStore.userInfos.docCount + 1)
                    router.replace('/upload')
                } catch {
                    console.log('delete error!')
                }
            },
            onCancel() {
                console.log('Cancel');
            },
        })
    }
}
const priceRef = ref(null)
const showPayModal = () => {
    if (userStore.isLogin) {
        sidebarStore.openPriceModal()
    } else {
        navbarStore.openLogin()
    }
}

const flag = computed(() => route.meta.analysis)

const queryParams = reactive({ key: '', sort: 'time' })

const currentMenus = computed(() => {
    if (!flag.value) {
        return sidebarStore.sessions
    } else {
        return sidebarStore.fileList
    }
})

const onSortChange = () => sidebarStore.getRecentFileList(queryParams)

const onSearch = () => sidebarStore.getRecentFileList(queryParams)

const price = defineAsyncComponent(() => import('./Price.vue'))

</script>

<template>
    <div class="sidebar flex-column">
        <div class="logo-wrapper flex justify-center">
            <img class="logo" src="@/assets/images/sidebar/logo.png" alt="">
        </div>

        <template v-if="!flag">
            <div class="menu-wrapper flex align-center justify-between">
                <RouterLink :to="item.path" v-for="(item, index) in menus" :key="index">
                    <div class="menu-item flex align-center justify-center">
                        <img :src="item.icon" alt="">
                        <span class="name">{{ item.name }}</span>
                    </div>
                </RouterLink>
            </div>
        </template>
        <template v-else>
            <router-link to="/upload" class="button-wrapper flex align-center justify-center">
                <img src="@/assets/images/analysis/upload.png" alt="">
                <span class="text">上传文件</span>
            </router-link>
            <div class="flex align-center justify-between" style="margin-bottom: 12px;">
                <a-input allowClear v-model:value="queryParams.key" placeholder="搜索" size="large"
                    style="width:50%;background-color:rgba(255,255,255,0.15);border: none;" @change="onSearch">
                    <template #prefix>
                        <search-outlined style="color: #ffffff;font-size: 20px;" />
                    </template>
                </a-input>
                <a-select v-model:value="queryParams.sort" size="large" style="width: 50%;margin-left: 8px;"
                    @change="onSortChange">
                    <a-select-option value="time">按时间排序</a-select-option>
                    <a-select-option value="name">按名称排序</a-select-option>
                </a-select>
            </div>
        </template>

        <div class="scroller-wrapper">
            <a-skeleton active :loading="loading" :paragraph="{ width: '100%', rows: 4 }">
                <template v-if="currentMenus.length">
                    <RouterLink :to="!flag ? `/conversation/${item.id}` : `/document/${item.id}`"
                        v-for="item in currentMenus" :key="item.id">
                        <div class="card" :class="{ 'active': chatId === item.id }" :id="item.id">
                            <div class="cardhd flex align-center justify-between">
                                <div class="logo flex align-center ">
                                    <img class="avatar" :src="flag ? item.avatar : baseurl + item.avatar" alt="">
                                    <div class="name ellipsis">{{ item.name }}
                                    </div>
                                </div>
                                <div class="delete" @click.prevent="onHandleDelete(item.id)">
                                    <img src="@/assets/images/sidebar/delete.png" alt="">
                                </div>
                            </div>
                            <div class="cardbd flex align-center justify-between">
                                <div class="count">{{ item.msgCount }}条对话</div>
                                <div class="time">{{ item.updatedAt }}</div>
                            </div>
                            <div class="triangle"></div>
                        </div>
                    </RouterLink>
                </template>
                <template v-else>
                    <div class="empty flex-column align-center justify-center">
                        <img src="@/assets/images/sidebar/robot.png" alt="">
                        <div class="word">暂无内容~</div>
                    </div>
                </template>
            </a-skeleton>

        </div>


        <div class="vipinfo-wrapper" @click="showPayModal">
            <template v-if="userStore.isExperience || !userStore.isLogin">
                <div class="times">今日可免费对话次数 {{ userStore.userInfos.count }}</div>
                <div class="vip-box">
                    <img class="title" src="@/assets/images/sidebar/join-text.png" alt="">
                    <div class="text">成为会员与 AI 畅想无限对话</div>
                </div>
            </template>
            <template v-if="!userStore.isExperience && userStore.validVip">
                <div class="times">不限制与AI对话次数</div>
                <div class="vip-box">
                    <img class="title" src="@/assets/images/sidebar/joined-text.png" alt="" style="width: 99px;">
                    <div class="text">会员特权将于{{ moment(userStore.userInfos.expires).format('YYYY-MM-DD') }}日到期</div>
                </div>
            </template>
            <template v-if="!userStore.isExperience && userStore.invalidVip && userStore.isLogin">
                <div class="time" style="opacity: 0;">😀author by chengwm 2023</div>
                <div class="vip-box">
                    <img class="title" src="@/assets/images/sidebar/xufei-text.png" alt="">
                    <div class="text">您的会员已过期{{ userStore.userInfos.overDays }}天</div>
                </div>
            </template>
        </div>
    </div>

    <price ref="priceRef" />
</template>


<style lang="less" scoped>
::v-deep(.ant-select-single.ant-select-lg:not(.ant-select-customize-input) .ant-select-selector) {
    background-color: rgba(255, 255, 255, 0.15);
    border: none;
    color: #ffffff;
}

::v-deep(.ant-input.ant-input-lg) {
    color: #ffffff;
}

.sidebar {
    width: 300px;
    height: 100%;
    background: linear-gradient(180deg, #3941FF, #3988FF);
    padding: 20px;
    box-sizing: border-box;

    .logo-wrapper {
        .logo {
            width: 160px;
            height: 40px;
        }
    }

    .menu-wrapper {
        margin: 20px 0;

        .menu-item {
            width: 124px;
            height: 40px;
            border-radius: 8px;
            background-color: #fff;
            cursor: pointer;
            transition: all .3s;

            &>img {
                width: 16px;
                height: 16px;
                margin-right: 4px;
            }

            .name {
                font-size: 13px;
                color: #3275f3;
            }

            &:hover {
                background-color: #ebf2ff;
            }
        }
    }

    .button-wrapper {
        width: 260px;
        height: 42px;
        background: #ffffff;
        border-radius: 8px;
        margin: 20px 0;
        transition: transform .3s;
        cursor: pointer;

        &:hover {
            transform: scale(1.05);
            background: #ecefff;
        }

        &>img {
            width: 16px;
            height: 16px;
        }

        .text {
            margin-left: 8px;
            font-size: 15px;
            color: #3275f3;
        }
    }

    .scroller-wrapper {
        flex: 1;
        overflow-y: auto;
        margin-right: -18px;
        margin-left: -20px;
        padding: 2px 20px 0;

        // 滚动条样式
        &::-webkit-scrollbar {
            width: 4px;
        }

        &::-webkit-scrollbar-thumb {
            border-radius: 10px;
            background: rgba(0, 0, 0, 0.2);
            background: rgba(204, 204, 204, 1);
        }

        &::-webkit-scrollbar-track {
            border-radius: 0;
            background: rgba(0, 0, 0, 0.1);
            background: transparent;
        }

        ::v-deep(.ant-skeleton-paragraph>li) {
            height: 74px;
            border-radius: 8px;
        }

        .card {
            background: #ffffff;
            border-radius: 8px;
            padding: 12px;
            box-sizing: border-box;
            margin-bottom: 12px;
            transition: transform .3s;
            margin-right: -8px;
            position: relative;

            &:hover {
                background: #ecefff;
                transform: scale(1.05);

                .triangle {
                    border-bottom: 10px solid #ecefff;
                }
            }

            .cardhd {
                margin-bottom: 12px;

                .logo {
                    flex: 1;

                    .avatar {
                        flex-shrink: 0;
                        width: 24px;
                        height: 24px;
                        border: 1px solid rgba(0, 0, 0, 0.10);
                        border-radius: 6px;
                    }

                    .name {
                        // flex: 1;
                        width: 180px;
                        margin-left: 8px;
                        font-size: 14px;
                        font-weight: 700;
                        color: #000000;
                        line-height: 24px;
                    }
                }

                .delete {
                    margin-left: 10px;

                    &>img {
                        width: 16px;
                        height: 16px;
                    }
                }
            }

            .cardbd {
                color: #000000;
                font-size: 12px;
                line-height: 14px;
            }

            .triangle {
                width: 0;
                height: 0;
                border-left: 10px solid transparent;
                border-right: 10px solid transparent;
                border-bottom: 10px solid #ffffff;
                /* 可以修改背景颜色 */
                position: absolute;
                top: 50%;
                transform: translateY(-50%) rotate(90deg);
                right: -10px;
                display: none;
            }

            &.active {
                transform: scale(1.05);
                background: #ecefff;

                .triangle {
                    display: block;
                    border-bottom: 10px solid #ecefff;
                }
            }
        }

        .empty {
            height: 74px;
            background: #ffffff;
            border-radius: 8px;

            &>img {
                width: 36px;
                height: 36px;
            }

            .word {
                margin-top: 4px;
                font-size: 12px;
                color: #999999;
                line-height: 14px;
            }
        }
    }

    .vipinfo-wrapper {
        cursor: pointer;

        .times {
            font-size: 13px;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.60);
            text-align: center;
            margin: 12px 0;
        }

        @keyframes blink {
            0% {
                background-image: url('@/assets/images/sidebar/vipbox-bg.png');
                box-shadow: none;
            }

            100% {
                background-image: url('@/assets/images/sidebar/vipboxbg-shadow.png');
                box-shadow: 0px 0px 8px 0px rgba(255, 255, 255, 0.50);
            }
        }

        .vip-box {
            box-sizing: border-box;
            padding: 24px;
            height: 96px;
            background: url('@/assets/images/sidebar/vipbox-bg.png') no-repeat center;
            background-size: 100% 94px;
            animation: blink 1s linear infinite alternate;
            border-radius: 12px;
            overflow: hidden;

            .title {
                width: 79px;
                height: 20px;
                margin-bottom: 6px;
            }

            .text {
                font-size: 15px;
                color: #ffffff;
            }
        }
    }
}
</style>