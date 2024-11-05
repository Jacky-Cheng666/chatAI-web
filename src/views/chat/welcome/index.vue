<script setup name="welcome">
import { welcomeListAPI } from '@/api/welcome'
import { addAiAPI } from '@/api/community'
import { computed, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
import { useUserStore } from '@/stores/user'
const sidebarStore = useSidebarStore()
const userStore = useUserStore()
const router = useRouter()
const state = reactive({
    list: [],
    queryParams: {
        page: 1,
        size: 15
    },
    loading: true
})
const baseurl = computed(() => import.meta.env.VITE_API_URL)
const getTableRows = async () => {
    state.loading = true
    const { list } = await welcomeListAPI(state.queryParams)
    state.loading = false
    state.list = list
}

const toConversation = async (row) => {
    if (userStore.isLogin) {
        await addAiAPI({ presetId: row.id })
        await sidebarStore.getSessions()
    }
    router.push(`/conversation/${row.id}`)
}

onMounted(() => {
    getTableRows()
})

</script>
<template>
    <div class="container">
        <div class="main">
            <header>
                <div class="title">欢迎使用 聆雀Chat AI</div>
                <div class="slogan">与AI一起畅想无限可能！以人民为中心，让人民安全的使用最前沿的技术，引导科技更好的为人民服务</div>
            </header>

            <section>
                <div class="text">请选择下方一个AI机器请选择下方一个AI机器人，即可开始聊天啦，想要探索更多的AI机器人，可以前往《AI广场》导航栏里进行搜索和添加哦。祝您使用愉快！</div>
                <a-spin :spinning="state.loading">
                    <div class="cardlist flex justify-between">
                        <div class="card flex-column justify-between" v-for="card in state.list" :key="card.id"
                            @click="toConversation(card)">
                            <div class="cardhd flex align-center">
                                <img class="robotavatar" :src="baseurl + card.avatar" alt="">
                                <div class="robotname ellipsis">{{ card.name }}</div>
                            </div>
                            <div class="cardbd ellipsis2">{{ card.descriptions }}</div>
                        </div>
                    </div>
                </a-spin>

            </section>
        </div>
    </div>
</template>



<style lang="less" scoped>
.container {
    .main {
        width: 872px;
        margin: 86px auto 0;

        .title {
            font-size: 33px;
            font-weight: 900;
            margin-bottom: 13px;
        }

        .slogan {
            font-size: 15px;
            line-height: 18px;
            margin-bottom: 56px;
        }

        section {
            .text {
                font-size: 15px;
                line-height: 24px;
                margin-bottom: 40px;
            }

            .cardlist {
                flex-wrap: wrap;

                .card {
                    flex-shrink: 0;
                    width: 280px;
                    height: 134px;
                    margin-bottom: 16px;
                    background: linear-gradient(180deg, #e9f0ff, #fefefe 100%);
                    border: 1px solid #ffffff;
                    border-radius: 12px;
                    padding: 20px;
                    color: #000000;
                    box-shadow: 0px 4px 8px 0px rgba(55, 99, 170, 0.07);
                    transition: transform .2s;
                    cursor: pointer;

                    &:hover {
                        transform: translateY(-4px);
                    }

                    .cardhd {
                        .robotavatar {
                            width: 36px;
                            height: 36px;
                            margin-right: 16px;
                            border: 1px solid rgba(0, 0, 0, 0.1);
                            border-radius: 12px;
                        }

                        .robotname {
                            font-size: 15px;
                            font-weight: 700;
                            line-height: 24px;
                        }
                    }

                    .cardbd {
                        font-size: 13px;
                        color: rgba(0, 0, 0, 0.60);
                        line-height: 21px;
                    }

                }
            }
        }
    }
}

:deep(.ant-skeleton-content .ant-skeleton-paragraph>li) {
    height: 134px;
    border-radius: 12px;
}
</style>