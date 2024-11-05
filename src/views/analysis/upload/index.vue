<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import { UploadOutlined } from '@ant-design/icons-vue'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { document } from '@/api/analysis'
import { message } from 'ant-design-vue'
import bus from '@/utils/bus'
import router from '@/router'
import lottie from 'lottie-web'
import uping from '@/assets/images/analysis/uping.json'
const sidebarStore = useSidebarStore()
const userStore = useUserStore()

const beforeUpload = file => {
    const validType = [
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'application/pdf',
        'text/html'
    ]
    const isValidFile = validType.includes(file.type)
    if (!isValidFile) {
        message.error('仅支持上传.doc .txt .pdf .html格式的文件!')
        return false
    }
    const isLt15M = file.size / 1024 / 1024 < 15
    if (!isLt15M) {
        message.error('文件大小不能超过15M!')
        return false
    }
    return true
}
const loading = ref(false)
const handleUpload = async (data) => {
    try {
        const { file } = data
        loading.value = true
        const { docId } = await document(file)
        router.push(`/document/${docId}`)
        sidebarStore.getRecentFileList({ key: '', sort: 'time' })
        userStore.changeDocTimes(userStore.userInfos.docCount - 1)
    } catch (error) {
        const { data } = error.response
        const { errcode } = data
        if (errcode === '50006') {
            console.log('user expired');
        }
    } finally {
        loading.value = false
        percent.value = 0
    }
}
const percent = ref(0)

const onPercent = per => {
    percent.value = per
    if (per >= 100) {
        lottieInstance.playSegments([50, 99], true)
    }
}

const tipText = computed(() => {
    if (percent.value < 100) {
        return '上传您的文件需要一些时间，请相信我们，这是值得的！'
    } else {
        return '文件已上传成功，正在解析中，请稍后...'
    }
})

const chooseFile = () => {
    if (userStore.userInfos.docCount <= 0) {
        message.warn('文件上传额度已用完~')
    }
}

let lottieInstance = null

watch(loading, (visible) => {
    if (visible) {
        nextTick(() => {
            lottieInstance = lottie.loadAnimation({
                container: window.document.querySelector('.animation'), // the dom element that will contain the animation
                renderer: 'svg',
                loop: true,
                autoplay: false,
                animationData: uping // the path to the animation json
            })
            lottieInstance.playSegments([0, 49], true)
        })
    }

}, { immediate: true })

onMounted(() => {
    sidebarStore.getRecentFileList({ key: '', sort: 'time' })
    bus.on('progress', onPercent)
})
onUnmounted(() => {
    bus.off('progress', onPercent)
    lottieInstance && lottieInstance.destroy()
})
</script>
<template>
    <div class="container">
        <div class="what">
            <div class="title">文案分析是什么？</div>
            <div class="desc">将您的文件转换为交互式聊天机器人，以娱乐、互动、有趣的方式探索它们，轻松地解答问题或寻求相关信息，让它们成为您的新朋友</div>
        </div>
        <div class="dragger">
            <a-upload-dragger :disabled="loading || userStore.userInfos.docCount === 0" :maxCount="1"
                :showUploadList="false" :before-upload="beforeUpload" :customRequest="handleUpload">
                <div v-if="!loading" class="before">
                    <img src="@/assets/images/upload/format.png" alt="">
                    <p class="word">将文件拖到此处开始体验</p>
                </div>
                <div v-else class="process flex-column align-center">
                    <div class="animation"></div>
                    <div class="bar flex align-center">
                        <div class="percent" style="opacity: 0;">100%</div>
                        <div class="progress">
                            <div class="p" :style="`width:${percent}%`"></div>
                        </div>
                        <div class="percent">{{ percent.toFixed(0) }}%</div>
                    </div>
                    <div class="text">{{ tipText }}</div>
                </div>
            </a-upload-dragger>
        </div>

        <div class="button-region flex align-center justify-between">
            <a-upload :disabled="loading || userStore.userInfos.docCount === 0" :maxCount="1" :showUploadList="false"
                :before-upload="beforeUpload" :customRequest="handleUpload">
                <span class="tip">或者您也可以</span>
                <a-button type="primary" size="large" @click="chooseFile">
                    <upload-outlined />
                    选择文件
                </a-button>
            </a-upload>
            <div class="remain-text" :class="{ 'danger': userStore.userInfos.docCount <= 0 }">剩余可上传文件数：{{
                userStore.userInfos.docCount }}</div>
        </div>

        <div class="recommend">
            <div>1. 请上传.doc .txt .pdf .html格式的文件，其他格式文件上传后可能会导致解析失败；</div>
            <div>2. 上传的文件大小不超过15M；</div>
            <div>3. 确保上传文件内容清晰完整，清晰度太低会影响文件解析；</div>
        </div>
    </div>
</template>



<style lang="less" scoped>
::v-deep(.ant-upload.ant-upload-drag) {
    background: rgba(50, 117, 243, 0.05);
    border: 1px dashed #3275f3;
    border-radius: 12px;
    width: 720px;
    height: 200px;
    margin: 0 auto;
}

.container {
    padding-top: 60px;
    width: 720px;
    margin: 0 auto;

    .what {
        margin-left: -22px;
        width: 764px;
        height: 164px;
        background: url('@/assets/images/upload/what.png') no-repeat center;
        background-size: 100%;
        box-sizing: border-box;
        padding: 24px 45px 0;

        .title {
            font-size: 17px;
            font-weight: 700;
            color: #ffffff;
            line-height: 20px;
            margin-bottom: 15px;
        }

        .desc {
            font-size: 13px;
            font-weight: 500;
            color: #ffffff;
            line-height: 20px;
            width: 444px;
        }
    }

    .dragger {
        .before {
            margin-top: 14px;

            &>img {
                width: 354px;
                height: 108px;
            }

            .word {
                font-size: 15px;
                font-weight: 700;
                color: #3275f3;
                line-height: 18px;
            }
        }

        .process {
            margin-top: 10px;

            .animation {
                width: 40px;
                height: 40px;
            }

            .bar {
                margin: 24px 0;

                .progress {
                    width: 100px;
                    height: 4px;
                    background: #d9d9d9;
                    border-radius: 2px;
                    position: relative;
                    margin: 0 12px;

                    .p {
                        position: absolute;
                        left: 0;
                        top: 0;
                        background: #3275f3;
                        border-radius: 2px;
                        height: 4px;
                        transition: all .3s;
                    }
                }

                .percent {
                    font-weight: 400;
                    font-size: 12px;
                    color: #3275f3;
                    line-height: 14px;
                }
            }

            .text {
                font-size: 15px;
                color: #3275f3;
                line-height: 18px;
            }
        }


    }

    .button-region {
        margin: 30px auto 50px;

        .tip {
            font-size: 13px;
            color: #000000;
            line-height: 15px;
            margin-right: 12px;
        }

        .remain-text {
            font-size: 13px;
            color: rgba(0, 0, 0, 0.40);

            &.danger {
                color: #F54968;
            }
        }
    }

    .recommend {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.40);
        line-height: 23px;
    }
}
</style>