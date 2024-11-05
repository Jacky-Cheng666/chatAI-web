<script setup>
import { modelListAPI, changeModelAPI } from '@/api/session'
import { reactive, ref, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
const userStore = useUserStore()
const onCancel = () => {
  visible.value = false
  cellRefs.value.forEach(el => el.resetFields())
}
const visible = ref(false)
const openModal = () => visible.value = true

watch(visible, (visible) => visible && getTableRows())

const table = reactive({
  rows: []
})
const getTableRows = async () => {
  const { list } = await modelListAPI()
  table.rows = list
}

const formState = reactive({
  activeModel: userStore.userInfos.modelId,
  key: ''
})

const onChange = (cell) => {
  formState.activeModel = cell.id
  formState.key = ''
}

const confirmLoading = ref(false)
const cellRefs = ref([])
const handleOk = async () => {
  confirmLoading.value = true
  if (formState.activeModel !== table.rows[0].id) {
    const index = table.rows.findIndex(t => t.id === formState.activeModel)
    try {
      await cellRefs.value[index].validate()
      await changeModelAPI(formState.activeModel, formState.key)
      message.success('切换成功')
      confirmLoading.value = false
      visible.value = false
      userStore.getUserInfo()
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
      confirmLoading.value = false
    }
  } else {
    try {
      await changeModelAPI(formState.activeModel, formState.key)
      message.success('切换成功')
      confirmLoading.value = false
      visible.value = false
      userStore.getUserInfo()
    } catch (error) {
      confirmLoading.value = false
    }
  }
}

defineExpose({ openModal })
</script>

<template>
  <div class="switch-model">
    <a-modal v-model:visible="visible" title="AI模型选择" :confirm-loading="confirmLoading" @cancel="onCancel" @ok="handleOk">
      <a-radio-group v-model:value="formState.activeModel">
        <div class="cell flex-column" :class="{ 'active': formState.activeModel === cell.id }" v-for="cell in table.rows"
          :key="cell.id" @click="onChange(cell)">
          <div class="flex align-center">
            <div class="name">{{ cell.name }}</div>
            <div v-if="cell.recommended === 1" class="tag flex align-center">
              <img src="@/assets/images/mine/recomm-tag.png" alt="">
            </div>
            <div class="mlauto">
              <a-radio :value="cell.id" style="margin-right: 0;"></a-radio>
            </div>
          </div>
          <div class="desc">{{ cell.descriptions }}</div>
          <a-form ref="cellRefs" :model="formState"
            v-show="formState.activeModel === cell.id && formState.activeModel !== table.rows[0].id">
            <a-form-item name="key" :rules="[{ required: true, message: '输入您的API密钥!', trigger: 'blur' }]">
              <a-input v-model:value="formState.key" placeholder="输入您的 API 密钥 sk-xxxxxxxxxxxx" />
              <div class="tip">API密钥安全的存储在您的设备上</div>
            </a-form-item>
          </a-form>
        </div>
      </a-radio-group>
    </a-modal>
  </div>
</template>

<style lang="less" scoped>
::v-deep(.ant-input) {
  background-color: #ffffff !important;
}

.cell {
  min-height: 76px;
  background: #edf0f4;
  border-radius: 12px;
  box-sizing: border-box;
  padding: 16px;
  position: relative;
  margin-bottom: 16px;
  width: 472px;
  cursor: pointer;

  &.active {
    border: 2px solid #3275f3;
  }

  .name {
    font-size: 15px;
    font-weight: 700;
    line-height: 18px;
    color: #000000;
  }

  .tag {
    margin-left: 8px;

    &>img {
      width: 34px;
      height: 18px;
    }
  }

  .desc {
    margin-top: 5px;
    margin-bottom: 16px;
    font-size: 13px;
    color: rgba(0, 0, 0, 0.60);
    line-height: 20px;
  }

  .tip {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.40);
    line-height: 14px;
    margin-top: 8px;
  }
}
</style>