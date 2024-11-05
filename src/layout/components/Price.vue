<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import moment from 'moment'
import { useUserStore } from '@/stores/user'
import { rightsAPI, transactionAPI, payStatusAPI, closePayAPI } from '@/api/pay'
import right1 from '@/assets/images/price/right-1.png'
import right2 from '@/assets/images/price/right-2.png'
import right3 from '@/assets/images/price/right-3.png'
import right4 from '@/assets/images/price/right-4.png'
import QRCode from 'qrcode'
import { message } from 'ant-design-vue'
import { useSidebarStore } from '@/stores/sidebar'
const userStore = useUserStore()
const sidebarStore = useSidebarStore()
const bodyStyle = {
  'background': "linear-gradient(90deg,#3941ff 0%, #3988ff 100%)",
  'borderRadius': '12px',
}
const status = computed(() => {
  let text = ''
  if (userStore.isExperience) {
    text = '未开通'
  }
  if (!userStore.isExperience && userStore.validVip) {
    text = '已开通'
  }
  if (!userStore.isExperience && userStore.invalidVip) {
    text = `已过期${userStore.userInfos.overDays}`
  }
  return text
})
const rights = ref([
  {
    icon: right1,
    text: 'AI 无限次数</br>消息回复'
  },
  {
    icon: right2,
    text: '文案分析</br>无限次数使用'
  },
  {
    icon: right3,
    text: '专属客服</br>为您服务'
  },
  {
    icon: right4,
    text: '新功能</br>抢先体验'
  }
])
const rightList = ref([])
const spinning = ref(false)
const getRightList = async () => {
  spinning.value = true
  const { list } = await rightsAPI()
  spinning.value = false
  rightList.value = list
  activeId.value = list[0].id
}
watch(() => sidebarStore.showPrice, visible => {
  if (visible) {
    getRightList()
  }
})

const activeId = ref('')
const chooseProduct = (item) => {
  activeId.value = item.id
}
const payStep = ref(1)
const loading = ref(false)
const orderNo = ref('')
const handleOrder = async () => {
  try {
    loading.value = true
    const { data } = await transactionAPI(activeId.value)
    payStep.value = 2
    orderNo.value = data.out_trade_no
    nextTick(() => renderQrcode(data.code_url))
  } catch (__) {
    console.log(__);
  } finally {
    loading.value = false
  }
}
const renderQrcode = (text) => {
  QRCode.toCanvas(document.getElementById('qrcode'), text, { width: 170, scale: 1, errorCorrectionLevel: 'H' }, function (error) {
    if (error) console.error(error)
    console.log('success!');
    // 轮询查订单状态
    getPaystatus(orderNo.value)
  })
}
const timerId = ref(null)
const getPaystatus = async () => {
  const { trade_state } = await payStatusAPI(orderNo.value)
  if (trade_state === 'SUCCESS') {
    clearInterval(timerId.value)
    message.success('支付成功！')
    sidebarStore.closePriceModal()
    payStep.value = 1
    userStore.getUserInfo()
  }
  timerId.value = setTimeout(getPaystatus, 3000);
}
const handleCancel = () => {
  payStep.value = 1
  clearInterval(timerId.value)
  if (orderNo.value) {
    closePayAPI(orderNo.value)
  }

}
const amount = computed(() => {
  const item = rightList.value.find(t => t.id === activeId.value)
  return item ? item.pref_price : 0
})
</script>

<template>
  <a-modal wrapClassName="price" v-model:visible="sidebarStore.showPrice" width="760px" :footer="null" :keyboard="false"
    :maskClosable="false" :bodyStyle="bodyStyle" destroyOnClose @cancel="handleCancel">
    <div class="emp flex">
      <div class="avatar">
        <img :src="userStore.userInfos.avatar" alt="">
      </div>
      <div class="info">
        <div class="label">充值账号：{{ userStore.userInfos.phone }}</div>
        <div class="flex align-center">
          <div class="status flex justify-center align-center">{{ status }}</div>
          <div class="exp" v-if="!userStore.isExperience && userStore.validVip">会员有效期至：{{
            moment(userStore.userInfos.expires).format('YYYY-MM-DD') }}</div>
        </div>
      </div>
      <img class="vbg" src="@/assets/images/price/vipbg.png" alt="">
    </div>
    <div class="content flex">
      <div class="rights">
        <div class="title flex align-center">
          <img class="vt" src="@/assets/images/price/viptg.png" alt="">
          <span class="name">会员权益</span>
        </div>
        <div class="right flex align-center" v-for="(item, index) in rights" :key="index">
          <div class="icon">
            <img :src="item.icon" alt="">
          </div>
          <div class="text" v-html="item.text"></div>
        </div>
      </div>
      <div class="flex-1" style="margin-top: 27px;">
        <a-spin :spinning="spinning">
          <div v-if="payStep === 1" class="card-list flex justify-between">
            <div class="card" :class="{ 'active': activeId === item.id }" v-for="item in rightList" :key="item.id"
              @click="chooseProduct(item)">
              <div class="name">{{ item.description }}</div>
              <div class="opcice">&yen;{{ item.price }}</div>
              <div class="cprice">
                <span>&yen;</span>
                <span class="amount">{{ item.pref_price }}</span>
              </div>
              <div class="tag">
                <img src="@/assets/images/price/discount.png" alt="">
              </div>
            </div>
          </div>
        </a-spin>
        <div class="pay-container flex justify-center">
          <template v-if="payStep === 1">
            <div class="prepare flex-column align-center">
              <div class="label flex align-center">
                <span>应付金额：</span>
                <div class="amount">
                  <span style="font-size: 20px;">&yen;</span>
                  <span>{{ amount }}</span>
                </div>
              </div>
              <div class="agreement">支付视为您同意<a target="_blank" href="https://chatgpt.eyuai.com/gzh/1.html">《聆雀会员服务协议》</a>
              </div>
              <a-button class="ktbutton" type="primary" :loading="loading" @click="handleOrder">立即开通</a-button>
            </div>
          </template>
          <template v-if="payStep === 2">
            <div class="flex-column align-center">
              <canvas id="qrcode"></canvas>
              <div class="flex align-center" style="margin-bottom: 30px;">
                <img src="@/assets/images/price/wechatpay.png" alt="" style="width: 20px;height: 20px;">
                <span style="margin-left: 7px;font-size: 15px;color: rgba(0, 0, 0, .8);">微信支付</span>
              </div>
              <div>应付金额：<span style="font-size: 24px;font-weight: 500;color: #3941ff;">&yen;{{ amount }}</span></div>
            </div>
          </template>
        </div>
      </div>

    </div>
  </a-modal>
</template>

<style lang="less" scoped>
.price {
  .emp {
    height: 76px;
    position: relative;

    .avatar {
      margin-right: 12px;

      &>img {
        width: 40px;
        height: 40px;
        background: #9a9a9a;
        border: 1px solid #ffffff;
        border-radius: 8px;
      }
    }

    .info {
      flex: 1;
      color: #ffffff;

      .label {
        font-size: 15px;
        font-weight: 700;
        line-height: 15px;
        margin-bottom: 6px;
      }

      .status {
        width: 49px;
        height: 19px;
        background: rgba(0, 0, 0, 0.16);
        border-radius: 4px;
        font-size: 11px;
        line-height: 11px;
        margin-right: 8px;
      }

      .exp {
        font-size: 12px;
      }
    }

    .vbg {
      width: 108px;
      height: 100px;
      position: absolute;
      top: -24px;
      right: 10px;
    }
  }

  .content {
    background: #ecf2fd;
    margin: 0 -24px -24px -24px;
    border-radius: 12px;
    padding: 20px;
    box-sizing: border-box;

    .rights {
      width: 168px;
      margin-right: 40px;

      .title {
        margin-bottom: 24px;

        .vt {
          width: 47px;
          height: 26px;
        }

        .name {
          margin-left: 6px;
          font-size: 14px;
          font-weight: 700;
        }
      }

      .right {
        margin-bottom: 28px;

        .icon {
          margin-right: 12px;

          &>img {
            width: 56px;
            height: 56px;
          }
        }

        .text {
          font-size: 13px;
          color: #000000;
          line-height: 20px;
        }
      }
    }

    .card-list {
      height: 140px;
      margin-bottom: 16px;

      .card {
        width: 160px;
        height: 140px;
        background: #ffffff;
        border-radius: 12px;
        box-sizing: border-box;
        padding: 28px 20px 20px;
        position: relative;
        cursor: pointer;

        &.active {
          background: #ffffff url('@/assets/images/price/priceborder.png') no-repeat center;
          background-size: 160px 140px;
        }

        .name {
          font-size: 17px;
          font-weight: 700;
          color: rgba(0, 0, 0, 0.80);
          margin-bottom: 20px;
          line-height: 20px;
        }

        .opcice {
          font-size: 15px;
          color: #b0b0b0;
          text-decoration: line-through;
          line-height: 16px;
          margin-bottom: 8px;
        }

        .cprice {
          font-size: 20px;
          color: #3941ff;
          font-weight: 500;

          .amount {
            font-size: 24px;
            line-height: 28px;
          }
        }

        .tag {
          width: 72px;
          height: 29px;
          position: absolute;
          top: -20px;
          left: 0;

          &>img {
            width: 100%;
            height: 100%;
          }
        }
      }
    }

    .pay-container {
      background: #ffffff;
      border-radius: 12px;
      padding: 30px 20px;

      .prepare {

        .label {
          font-size: 15px;
          color: rgba(0, 0, 0, 0.80);
          line-height: 20px;
          margin-bottom: 5px;

          .amount {
            font-size: 24px;
            font-weight: 500;
            color: #3941ff;
            line-height: 28px;
          }
        }

        .agreement {
          margin-bottom: 20px;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.40);
          line-height: 20px;
        }

        .ktbutton {
          width: 132px;
          height: 39px;
          background: #3275f3 linear-gradient(117deg, #e543ff 0%, #3941ff 52%, #3941ff 61%, #36fcfc 100%) linear-gradient(88deg, #3941ff 0%, #3988ff 100%);
          border-radius: 8px;
        }
      }

      #qrcode {
        border: 1px solid #48b338;
        margin-bottom: 12px;
      }
    }
  }
}
</style>