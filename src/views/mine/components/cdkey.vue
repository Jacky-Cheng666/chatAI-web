<script setup>
import { reactive, ref } from 'vue'
import { exchangeAPI } from '@/api/session'
import { Modal } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'
const userStore = useUserStore()
const visible = ref(false)
const formState = reactive({
  inputKey: ''
})
const formRef = ref(null)
const confirmLoading = ref(false)
const handleOk = async () => {
  try {
    await formRef.value.validate()
    confirmLoading.value = true
    const { expires, cdkeyType, amount } = await exchangeAPI(formState.inputKey.trim())
    confirmLoading.value = false
    visible.value = false
    const labelObj = {
      week: '周卡',
      month: '月卡',
      year: '年卡'
    }
    Modal.success({
      title: '兑换成功',
      content: `已成功兑换【 ${labelObj[cdkeyType]} x ${amount} 】聆雀VIP会员，有效期至：${expires}`,
      centered: true,
      onOk: () => {
        userStore.getUserInfo()
      }
    });
  } catch (error) {
    console.log(error);
    confirmLoading.value = false
  }
}
const handleCancel = () => {
  visible.value = false
  formState.inputKey = ''
  formRef.value.resetFields()
}
const openModal = () => visible.value = true
defineExpose({ openModal })
</script>

<template>
  <div class="cdkey">
    <a-modal centered v-model:visible="visible" title="会员兑换" :confirm-loading="confirmLoading" @cancel="handleCancel"
      @ok="handleOk">
      <a-form ref="formRef" layout="vertical" :model="formState" autocomplete="off">
        <a-form-item name="inputKey" label="兑换码" :rules="[{ required: true, message: '请输入兑换码', trigger: 'blur' }]">
          <a-input v-model:value="formState.inputKey" placeholder="请输入兑换码" allowClear style="height: 36px;" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>
