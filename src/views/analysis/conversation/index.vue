<script setup>
import { reactive, ref, createVNode, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { clearHistoryAPI, docHistoryAPI } from '@/api/analysis'
import { useUserStore } from '@/stores/user'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import clip from '@/utils/clipboard'
import moment from 'moment'
import { EventSourcePolyfill } from 'event-source-polyfill'
import { useSidebarStore } from '@/stores/sidebar'
import { useRoute } from 'vue-router'
const route = useRoute()
const userStore = useUserStore()
const sidebarStore = useSidebarStore()

const state = reactive({
  inputValue: '',
  placeholder: '输入你的问题（按回车键发送，Shift+回车键换行）',
  loading: false,
  messageList: [],
})
const docId = computed(() => route.params.id)
const getTableRows = async (cb) => {
  if (state.loading) return
  state.loading = true
  const { list } = await docHistoryAPI({
    docId: docId.value,
    endDate: state.messageList.length > 0 ? state.messageList[0].createdAt : null
  })
  state.loading = false
  if (list.length === 0) {
    return message.info('已经到顶啦~')
  }
  state.messageList.unshift(...list)

  if (typeof cb === 'function') {
    cb()
  }
}

watch(() => state.messageList, () => {
  // 向下滚动
  scrollToBottom()

  // 给复制按钮绑定点击事件
  nextTick(() => {
    const copyEle = document.querySelectorAll('.copy')
    for (let i = 0; i < copyEle.length; i++) {
      copyEle[i].onclick = e => {
        let copyContent = e.target.nextSibling.innerText
        clip(copyContent, e)
      }
    }
  })
}, { deep: true })

const responsing = ref(false)
const eventSource = ref(null)

const sendMessage = (e) => {
  if (e && e.keyCode === 13 && e.shiftKey) return
  if (responsing.value) {
    return message.warn('AI正在回复中！')
  }
  if (!state.inputValue.trim()) {
    e && e.preventDefault()
    return message.warn('问点儿什么吧~')
  }
  state.messageList.push({
    role: 'user',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    content: state.inputValue
  })
  scrollFlag.value = true
  sidebarStore.updateFileCount(docId.value)

  state.messageList.push({
    role: 'assistant',
    createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
    content: ''
  })
  responsing.value = true
  const appType = import.meta.env.VITE_APP_TYPE
  const baseApi = import.meta.env.VITE_API_URL
  const encodeMsg = encodeURIComponent(state.inputValue.trim())
  eventSource.value = new EventSourcePolyfill(`${baseApi}/api/${appType}/docs/chatting/${docId.value}?msg=${encodeMsg}`, { headers: { Authorization: userStore.accessToken } })

  eventSource.value.addEventListener('open', () => {
    console.log('connected');
  })
  eventSource.value.addEventListener('error', (err) => {
    console.log('connect_error', err);
    responsing.value = false
    destoryEs()
  })

  eventSource.value.addEventListener('message', async (e) => {
    const message = JSON.parse(e.data)
    // console.log('message', message);

    if (message.msg === 'ready') {
      state.inputValue = ''
      state.messageList[state.messageList.length - 1].createdAt = message.botCreatedAt
    }

    if (message.msg === 'done') {
      responsing.value = false
      sidebarStore.updateFileCount(docId.value)
      destoryEs()

    }

    if (!['ready', 'done'].includes(message.msg) && message.status === 0) {
      state.messageList[state.messageList.length - 1].content += message.msg
    } else if (!['ready', 'done'].includes(message.msg)) {
      switch (message.status) {
        case 50006:
          state.messageList[state.messageList.length - 1].content = '体验次数已使用完毕或会员已过期~'
          state.messageList[state.messageList.length - 1].isError = true
          break;

        case 50001:
          await userStore.refreshToken()
          sendMessage()
          break;

        case 50003:
          userStore.clear()
          window.location.reload()
          break;

        default:
          state.messageList[state.messageList.length - 1].content = message.msg
          state.messageList[state.messageList.length - 1].isError = true
          break;
      }
    }

  })
}

const destoryEs = () => {
  eventSource.value && eventSource.value.close()
}
const mdRender = (mdText) => {
  const md = new MarkdownIt({
    html: true,
    xhtmlOut: false,
    breaks: false,
    langPrefix: 'language-',
    linkify: false,
    typographer: false,
    quotes: '“”‘’',
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return '<pre class="hljs"><div class="copy">复制</div><code>' + hljs.highlight(lang, str, true).value + '</code></pre>';
        } catch (__) {
          console.log(__);
        }
      }
      return '<pre class="hljs"><div class="copy">复制</div><code>' + md.utils.escapeHtml(str) + '</code></pre>';
    }
  })
  return md.render(mdText)
}
const oldScrollTop = ref(0)
const backToRef = ref(null)
const onScroll = (e) => {
  const scrollTop = e.target.scrollTop
  const scrollStep = scrollTop - oldScrollTop.value
  oldScrollTop.value = scrollTop
  if (scrollStep < 0) {
    backToRef.value.style.display = 'flex'
    scrollFlag.value = false
  }

  // 页面滚动到底部了
  if (scrollTop >= e.target.scrollHeight - e.target.offsetHeight) {
    backToRef.value.style.display = 'none'
    scrollFlag.value = true
  }

  // 页面滚动到顶部
  if (scrollTop === 0) {
    getTableRows(() => scrollRef.value.scrollTop = 1)
  }
}

const onClearHistory = () => {
  if (responsing.value) {
    return message.warn('AI正在回复中，请稍后！')
  }
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定要清除当前会话的所有聊天记录吗？',
    okText: '确认',
    okType: 'primary',
    cancelText: '取消',
    centered: true,
    async onOk() {
      try {
        await clearHistoryAPI(docId.value)
        message.success('记录已清空！')
        state.messageList = []
        getTableRows()
      } catch {
        console.log('delete error!')
      }
    },
    onCancel() {
      console.log('Cancel');
    },
  })
}
const handleCopy = (text, event) => clip(text, event)

const scrollRef = ref(null)
const scrollFlag = ref(true)
const scrollToBottom = (force) => {
  nextTick(() => {
    if (force) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
      return
    }
    if (scrollFlag.value) {
      scrollRef.value.scrollTop = scrollRef.value.scrollHeight
    }
  })
}
const quickSend = text => {
  state.inputValue = text
  sendMessage()
}

onUnmounted(() => {
  state.messageList = []
  destoryEs()
})
onMounted(() => {
  getTableRows(scrollToBottom)
})
</script>
<template>
  <div class="container flex-column">
    <div ref="scrollRef" class="message-wrapper flex-1" @scroll="onScroll">
      <a-spin :spinning="state.loading">
        <div style="height: 40px;"></div>
      </a-spin>
      <div class="message" v-for="msg in state.messageList" :key="msg.uuid">
        <template v-if="msg.role === 'user'">
          <div class="userside flex mlauto">
            <div class="main">
              <div class="top flex align-center justify-between">
                <div class="time">{{ msg.createdAt }}</div>
                <div class="copy" @click="handleCopy(msg.content, $event)">
                  <a-tooltip placement="top">
                    <template #title>
                      <span>复制内容</span>
                    </template>
                    <img src="@/assets/images/conversation/copy.png" alt="">
                  </a-tooltip>
                </div>
              </div>
              <div class="bubble">{{ msg.content }}</div>
            </div>
            <div class="avatar">
              <img :src="userStore.userInfos.avatar" alt="">
            </div>
          </div>
        </template>
        <template v-else>
          <div class="aiside flex">
            <div class="avatar flex-column align-center">
              <img src="@/assets/images/analysis/davatar.png" alt="">
              <div class="shadow"></div>
            </div>
            <div class="main">
              <div class="top flex align-center justify-between">
                <div class="time">{{ msg.createdAt }}</div>
                <div v-if="msg.content && !msg.isError" class="copy" @click="handleCopy(msg.content, $event)">
                  <a-tooltip placement="top">
                    <template #title>
                      <span>复制内容</span>
                    </template>
                    <img src="@/assets/images/conversation/copy.png" alt="">
                  </a-tooltip>
                </div>
              </div>

              <div v-if="msg.content" class="bubble" :class="{ error: msg.isError }">
                <div v-html="mdRender(msg.content)"></div>
                <div v-if="msg.simpleQuestions">
                  <div class="question flex align-center" v-for="(text, i) in msg.simpleQuestions" :key="i"
                    @click="quickSend(text)">
                    <span>{{ text }}</span>
                    <img class="arrow" src="@/assets/images/analysis/arrow-right.png" alt="">
                  </div>
                </div>
              </div>
              <div v-else class="bubble">
                <img class="thinking" src="@/assets/images/conversation/thinking.gif" alt="">
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
    <div class="control-panel flex-column justify-between">
      <div class="flex align-center justify-center">
        <div class="clear" @click="onClearHistory">
          <img src="@/assets/images/conversation/clear.png" alt="">
        </div>
        <div class="input-wrapper">
          <a-textarea :bordered="false" class="input" size="large" :auto-size="{ minRows: 2, maxRows: 3 }"
            v-model:value="state.inputValue" :placeholder="state.placeholder" @pressEnter="sendMessage($event)" />
          <div class="send flex align-center justify-center" :class="{ 'disabled': responsing }" @click="sendMessage">
            <img class="icon_send" src="@/assets/images/conversation/icon_send.png" alt="" />
          </div>
        </div>
      </div>
      <div class="powerby">This website is powered by Eyuai .</div>
    </div>
    <!-- 返回底部 -->
    <div ref="backToRef" class="backTo flex align-center justify-center" @click="scrollToBottom(1 === 1)">
      <img src="@/assets/images/conversation/arrow_down.png" alt="" />
      <span>返回底部</span>
    </div>
  </div>
</template>



<style lang="less" scoped>
::v-deep(textarea.ant-input) {
  width: 740px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.03);
  padding-right: 104px;

  // 滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-track {
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }

  &::placeholder {
    font-size: 15px;
    color: rgba(0, 0, 0, 0.40);
  }

}

.container {
  overflow-y: hidden;
  height: 100%;
  position: relative;

  .message-wrapper {
    box-sizing: border-box;
    overflow-y: auto;
    overflow-x: hidden;

    // 滚动条样式
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.2);
    }

    &::-webkit-scrollbar-track {
      border-radius: 0;
      background: rgba(0, 0, 0, 0.1);
    }

    .message {
      width: 80%;
      margin: 0 auto 40px;

      .userside {
        width: 90%;
        justify-content: flex-end;

        .main {
          .top {
            margin-bottom: 10px;

            .time {
              font-size: 12px;
              color: rgba(0, 0, 0, 0.40);
              line-height: 12px;
              text-align: right;
              margin-right: 20px;
            }

            .copy {
              cursor: pointer;

              &>img {
                width: 16px;
                height: 16px;
              }
            }
          }

          .bubble {
            box-sizing: border-box;
            padding: 12px;
            background: #3275f3;
            border-radius: 12px 0px 12px 12px;
            font-size: 15px;
            color: #ffffff;
            line-height: 18px;
          }
        }

        .avatar {
          margin-left: 12px;

          &>img {
            width: 40px;
            height: 40px;
            border-radius: 12px;
          }


        }
      }

      .aiside {
        width: 90%;

        .avatar {
          margin-right: 12px;

          &>img {
            width: 40px;
            height: 40px;
            border: 1px solid rgba(0, 0, 0, 0.10);
            border-radius: 8px;
            position: relative;
            z-index: 1;
          }

          .shadow {
            width: 38px;
            height: 38px;
            background: #d9d9d9;
            border-radius: 12px;
            transform: translateY(-30px);

          }
        }

        .main {
          .top {
            margin-bottom: 10px;

            .time {
              font-size: 12px;
              color: rgba(0, 0, 0, 0.40);
              line-height: 12px;
              margin-right: 20px;
            }

            .copy {
              cursor: pointer;

              &>img {
                width: 16px;
                height: 16px;
              }
            }

          }

          .bubble {
            font-size: 15px;
            color: #000000;
            line-height: 26px;
            padding: 12px;
            background: rgba(0, 0, 0, 0.05);
            border-radius: 0px 12px 12px 12px;

            &.error {
              background: rgba(245, 73, 104, 0.10);
              border: 1px solid rgba(245, 73, 104, 0.30);
              color: #f54968;
            }

            ::v-deep(p:last-child) {
              margin-bottom: 0;
            }

            ::v-deep(img) {
              width: 100%;
            }

            ::v-deep(video) {
              width: 100%;
            }

            .thinking {
              width: 70px;
            }

            ::v-deep(.hljs) {
              border-radius: 12px;
              padding: 12px;
              position: relative;

              &:hover .copy {
                display: block;
              }

              .copy {
                position: absolute;
                right: 12px;
                top: 12px;
                cursor: pointer;
                display: none;
              }
            }

            .question {
              margin-top: 16px;
              font-size: 15px;
              color: #3275f3;
              line-height: 18px;
              cursor: pointer;

              .arrow {
                margin-left: 16px;
                width: 16px;
                height: 16px;
              }
            }
          }
        }
      }
    }

  }

  .control-panel {
    box-sizing: border-box;
    height: 140px;
    background: #ffffff;
    border-top: 1px solid rgba(0, 0, 0, 0.05);
    padding-top: 20px;
    padding-bottom: 16px;

    .input-wrapper {
      border-radius: 12px;
      margin: 0 40px;
      border: 2px solid #3275f3;
      position: relative;

      .send {
        width: 86px;
        height: 42px;
        background: linear-gradient(87deg, #3941ff, #3988ff);
        border-radius: 8px;
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        cursor: pointer;

        &>img {
          width: 20px;
          height: 20px;
        }

        &.disabled {
          background: rgba(0, 0, 0, 0.3);
          cursor: default;
        }
      }
    }

    .clear,
    .magic {
      cursor: pointer;

      &>img {
        width: 48px;
        height: 48px;
      }
    }

    .powerby {
      font-size: 13px;
      color: rgba(0, 0, 0, 0.40);
      line-height: 14px;
      text-align: center;
    }
  }

  .backTo {
    position: absolute;
    bottom: 160px;
    right: 10%;
    width: 112px;
    height: 40px;
    background: #ffffff;
    border: 1px solid #3275f3;
    border-radius: 21px;
    font-size: 15px;
    color: #3275f3;
    line-height: 16px;
    cursor: pointer;
    transition: all .3s;
    display: none;

    &>img {
      width: 24px;
      height: 24px;
    }
  }
}
</style>