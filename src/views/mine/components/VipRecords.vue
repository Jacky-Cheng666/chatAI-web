<script setup>
import { rechargeListAPI } from '@/api/session'
import { reactive, ref, watch } from 'vue'
import clip from '@/utils/clipboard'
import empty from '@/components/Empty/index.vue'
const visible = ref(false)
const state = reactive({
  rows: []
})
watch(visible, async () => {
  const { list } = await rechargeListAPI()
  state.rows = list
})

const handleCopy = (event, text) => clip(text, event)



const openModal = () => visible.value = true
defineExpose({ openModal })
</script>

<template>
  <a-modal v-model:visible="visible" title="会员开通记录" :footer="null" @cancel="visible = false">
    <div class="card-list">
      <template v-if="state.rows.length > 0">
        <div class="card" v-for="item in state.rows" :key="item.cdkey">
          <div class="header flex align-center">
            <div class="icon">
              <img src="@/assets/images/mine/icon-diamond.png" alt="">
            </div>
            <div class="name">聆雀Chat AI {{ item.description }}</div>
            <div class="mlauto price">&yen;<span class="amount">{{ item.paymentAmount }}</span></div>
          </div>
          <div class="body">
            <div class="row flex align-center">
              <div class="label">订单编号</div>
              <div class="code">{{ item.orderNum }}</div>
              <div class="copy" @click="handleCopy($event, item.orderNum)">复制</div>
            </div>

            <div class="row flex align-center">
              <div class="label">支付时间</div>
              <div class="time">{{ item.paidAt }}</div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <empty />
      </template>
    </div>
  </a-modal>
</template>


<style lang="less" scoped>
.card-list {
  height: 500px;
  overflow-y: auto;

  // 滚动条样式
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(0, 0, 0, 0.2);
  }

  &::-webkit-scrollbar-track {
    border-radius: 0;
    background: rgba(0, 0, 0, 0.1);
  }

  .card {
    margin-right: 12px;
    box-sizing: border-box;
    background: #edf0f4;
    border-radius: 12px;
    margin-bottom: 12px;

    .header {
      border-bottom: 0.5px solid rgba(0, 0, 0, 0.10);
      padding: 16px;
      padding-bottom: 12px;
      box-sizing: border-box;

      .icon {
        margin-right: 8px;

        &>img {
          width: 24px;
          height: 24px;
        }
      }

      .name {
        font-size: 15px;
        font-weight: 700;
      }

      .price {
        font-weight: 700;
        color: #3275F3;
        font-size: 15px;

        .amount {
          font-size: 20px;
        }
      }
    }

    .body {
      padding: 12px 16px 16px 16px;

      .row {
        font-size: 13px;

        .label {
          width: 52px;
          color: rgba(0, 0, 0, 0.4);
        }

        .code {
          margin-left: 20px;
          margin-right: 16px;
        }

        .copy {
          color: #3275F3;
          cursor: pointer;
        }

        .time {
          margin-left: 20px;
        }
      }
    }
  }
}
</style>