
<script setup>
import { CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import clip from '@/utils/clipboard'
import iconModel from '@/assets/images/mine/icon-model.png'
import iconCdk from '@/assets/images/mine/icon-cdk.png'
import iconCheck from '@/assets/images/mine/icon-check.png'
import iconVrecords from '@/assets/images/mine/icon-sheet.png'
import iconWechat from '@/assets/images/mine/icon-wechat.png'
import iconFeedback from '@/assets/images/mine/icon-print.png'
import { Modal, message } from 'ant-design-vue'
import { computed, createVNode, ref, defineAsyncComponent, onMounted } from 'vue'
import { logoutAPI, unbindWxAPI, bindWxAPI } from '@/api/session'
import config from '../../../package.json'
import { useRoute, useRouter } from 'vue-router'

const SwitchPhone = defineAsyncComponent(() => import('./components/SwitchPhone.vue'))
const SwitchModel = defineAsyncComponent(() => import('./components/SwitchModel.vue'))
const cdkeyModal = defineAsyncComponent(() => import('./components/cdkey.vue'))
const CdkRecords = defineAsyncComponent(() => import('./components/CdkRecords.vue'))
const VipRecords = defineAsyncComponent(() => import('./components/VipRecords.vue'))
const JoinWechat = defineAsyncComponent(() => import('./components/JoinWechat.vue'))
const feedback = defineAsyncComponent(() => import('./components/feedback.vue'))

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const phoneRef = ref(null)
const showSwitchModal = () => phoneRef.value.openModal()

const bindWeixinUrl = computed(() => {
  const state = +new Date()
  const redirectUrl = encodeURIComponent(import.meta.env.VITE_APP_HOST + '/mine')
  return `https://open.weixin.qq.com/connect/qrconnect?appid=wx5a21baeac709f546&redirect_uri=${redirectUrl}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`
})

const bindWeixin = () => {
  if (userStore.userInfos.isBindWx) {
    Modal.confirm({
      title: '提示',
      icon: createVNode(ExclamationCircleOutlined),
      content: '确认是否解除微信绑定，解除后需重新绑定微信才能扫码登录？',
      okText: '确认',
      okType: 'primary',
      cancelText: '取消',
      centered: true,
      async onOk() {
        try {
          await unbindWxAPI()
          message.success('解绑成功')
          userStore.getUserInfo()
        } catch {
          console.log('unbind error!')
        }
      },
      onCancel() {
        console.log('Cancel');
      },
    })
  } else {
    window.location.href = bindWeixinUrl.value
  }
}

const handleCopy = (event) => {
  clip(userStore.userInfos.userId.split('-')[0], event)
}

const cellGroups = [
  {
    name: '1',
    cells: [
      {
        name: 'model',
        icon: iconModel,
        label: 'AI模型选择',
        value: userStore.userInfos.modelName
      },
      {
        name: 'cdk',
        icon: iconCdk,
        label: '会员兑换',
        value: ''
      },
      {
        name: 'cdks',
        icon: iconCheck,
        label: '会员兑换记录',
        value: ''
      },
      {
        name: 'vrecord',
        icon: iconVrecords,
        label: '会员开通记录',
        value: ''
      }
    ]
  },
  {
    name: '2',
    cells: [
      {
        name: 'wechat',
        icon: iconWechat,
        label: '加入微信群聊',
        value: ''
      },
      {
        name: 'feedback',
        icon: iconFeedback,
        label: '意见反馈',
        value: ''
      }
    ]
  }
]

const handleLogout = () => {
  Modal.confirm({
    title: '提示',
    icon: createVNode(ExclamationCircleOutlined),
    content: '确定要退出当前的账号吗？',
    okText: '确认',
    okType: 'primary',
    cancelText: '取消',
    centered: true,
    async onOk() {
      try {
        await logoutAPI()
      } catch {
        console.log('delete error!')
      } finally {
        userStore.clear()
        window.location.reload()
      }
    },
    onCancel() {
      console.log('Cancel');
    },
  })
}

const version = computed(() => {
  const env = import.meta.env.MODE
  if (env === 'production') {
    return config.version
  } else if (env === 'development') {
    return '开发版'
  } else {
    return '测试版'
  }
})

const wxCode = computed(() => route.query.code)

const userBindWx = async () => {
  try {
    await bindWxAPI(wxCode.value)
    // 刷新用户信息
    message.success('绑定成功')
    userStore.getUserInfo()
  } catch (__) {
    console.log(__);
  } finally {
    router.replace('/mine')
  }
}

const modelRef = ref(null)
const cdkeyRef = ref(null)
const cdkeysRef = ref(null)
const vrecordsRef = ref(null)
const joinRef = ref(null)
const feedbackRef = ref(null)
const onCell = (row) => {
  const { name } = row
  switch (name) {
    case 'model':
      modelRef.value.openModal()
      break;
    case 'cdk':
      cdkeyRef.value.openModal()
      break;
    case 'cdks':
      cdkeysRef.value.openModal()
      break;
    case 'vrecord':
      vrecordsRef.value.openModal()
      break;
    case 'wechat':
      joinRef.value.openModal()
      break;
    case 'feedback':
      feedbackRef.value.openModal()
      break;


    default:
      break;
  }
}

onMounted(() => {
  if (wxCode.value) {
    userBindWx()
  }
})



</script>

<template>
  <div class="container">
    <div class="close flex justify-center align-center" @click="$router.back()"><close-outlined /></div>
    <div class="cell-group">
      <div class="cell flex align-center justify-between">
        <div class="flex align-center">
          <img class="icon" src="@/assets/images/mine/icon-phone.png" alt="">
          <span class="label">手机号</span>
        </div>
        <div>
          <span class="text-muted mr12">{{ userStore.userInfos.phone }}</span>
          <span class="text-primary" style="cursor: pointer;" @click="showSwitchModal">更换</span>
        </div>
      </div>
      <div class="cell flex align-center justify-between">
        <div class="flex align-center">
          <img class="icon" src="@/assets/images/mine/icon-wechat.png" alt="">
          <span class="label">微信</span>
        </div>
        <div>
          <span class="text-muted mr12">{{ userStore.userInfos.nickname }}</span>
          <span class="text-primary" style="cursor: pointer;" @click="bindWeixin">{{ userStore.userInfos.isBindWx ? '解绑' :
            '去绑定' }}</span>
        </div>
      </div>
      <div class="cell flex align-center justify-between">
        <div class="flex align-center">
          <img class="icon" src="@/assets/images/mine/icon-user.png" alt="">
          <span class="label">用户ID</span>
        </div>
        <div class="flex align-center" style="cursor: pointer;" @click="handleCopy($event)">
          <span class="text-muted mr12">{{ userStore.userInfos.userId.split('-')[0] }}</span>
          <img class="icon" src="@/assets/images/mine/icon-copy.png" alt="">
        </div>
      </div>
    </div>

    <div class="cell-group" v-for="group in cellGroups" :key="group.name">
      <div class="cell flex align-center justify-between" style="cursor: pointer;" v-for="(cell, index) in group.cells"
        :key="index" @click="onCell(cell)">
        <div class="flex align-center">
          <img class="icon" :src="cell.icon" alt="">
          <span class="label">{{ cell.label }}</span>
        </div>
        <div class="flex align-center">
          <span class="text-muted mr12">{{ cell.value }}</span>
          <img class="icon" src="@/assets/images/mine/icon-arrow.png" alt="">
        </div>
      </div>
    </div>
    <div class="version flex justify-center">版本号：{{ version }}</div>

    <div class="cell-group">
      <div class="logout flex justify-center align-center" @click="handleLogout">退出账号</div>
    </div>

    <switch-phone ref="phoneRef" />
    <switch-model ref="modelRef" />
    <cdkey-modal ref="cdkeyRef" />
    <cdk-records ref="cdkeysRef" />
    <vip-records ref="vrecordsRef" />
    <join-wechat ref="joinRef" />
    <feedback ref="feedbackRef" />
  </div>
</template>


<style lang="less" scoped>
.text-muted {
  color: rgba(0, 0, 0, 0.40);
}

.mr12 {
  margin-right: 12px;
}

.text-primary {
  color: #3275f3;
}

.container {
  width: 720px;
  margin: 80px auto 0;
  position: relative;

  .close {
    width: 36px;
    height: 36px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    position: fixed;
    top: 94px;
    right: 174px;
    cursor: pointer;
  }

  .cell-group {
    margin-bottom: 20px;
    border: 1px solid rgba(0, 0, 0, 0.10);
    border-radius: 12px;

    .cell {
      padding: 20px;
      box-sizing: border-box;
      height: 56px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.10);
      font-size: 15px;

      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }

      &:last-of-type {
        border-bottom: none;
      }

      .icon {
        width: 16px;
        height: 16px;
      }

      .label {
        font-weight: 500;
        margin-left: 12px;
      }
    }

    .logout {
      cursor: pointer;
      width: 720px;
      height: 56px;
      font-size: 15px;
      font-weight: 500;
      color: #fd4141;

      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }
    }
  }

  .version {
    color: rgba(0, 0, 0, 0.4);
    margin-top: -10px;
    margin-bottom: 10px;
  }
}
</style>