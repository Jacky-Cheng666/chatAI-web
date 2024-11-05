

<script setup>
import { onMounted, reactive, computed, ref, onUnmounted, watch } from 'vue'
import { getCategoryAPI, systemRobotsAPI, addAiAPI } from '@/api/community'
import { SearchOutlined } from '@ant-design/icons-vue'
import Empty from '@/components/Empty/index.vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import { useRouter } from 'vue-router'
import { useSidebarStore } from '@/stores/sidebar'
const sidebarStore = useSidebarStore()
const router = useRouter()
const state = reactive({
  categorys: [],
  table: {
    rows: [],
    total: 0,
    loading: false
  },
  loadText: '点击加载更多~'
})
const spinning = ref(false)
const queryParams = reactive({
  page: 1,
  size: 25,
  sort: '', //排序类型，不传为【综合排序】，hot为【热度排序】，date为【时间排序】
  searchKey: '',
  type: 0, //当前选择哪项分类
})

const categoryIcons = ['icon-quanbu', 'icon-zhiyezhuanjia', 'icon-xiaoshuaigongju', 'icon-xiezuofuzhu', 'icon-yingxiaowenan', 'icon-quweiyule', 'icon-shenghuobaike', 'icon-wangluobiancheng']

const baseUrl = computed(() => import.meta.env.VITE_API_URL)

const getCategory = async () => {
  state.table.loading = true
  const { list } = await getCategoryAPI()
  list.forEach((t, i) => t.icon = categoryIcons[i + 1])
  list.unshift({ id: 0, label: '全部', icon: categoryIcons[0] })
  state.categorys = list
  getTableRows()
}

const changeCate = id => {
  queryParams.type = id
  getTableRows()
}

const getTableRows = async () => {
  queryParams.page = 1
  spinning.value = true
  const { list } = await systemRobotsAPI(queryParams)
  state.table.loading = false
  spinning.value = false
  state.table.rows = list
  state.loadText = '点击加载更多~'
}

const debouncedFn = useDebounceFn(() => getTableRows(), 500)

const throttledFn = useThrottleFn(async () => {
  if (state.loadText === '没有更多了~') return
  queryParams.page += 1
  state.loadText = '加载中...'
  const { list } = await systemRobotsAPI(queryParams)
  state.loadText = '点击加载更多~'
  if (list.length === 0) {
    state.loadText = '没有更多了~'
    return
  }
  state.table.rows.push(...list)
}, 1000)

// const onScroll = e => {
//   const scrollTop = e.target.scrollTop
//   const clientHeight = e.target.clientHeight
//   const scrollHeight = e.target.scrollHeight
//   if (scrollTop + clientHeight >= scrollHeight) {
//     throttledFn()
//   }
// }
const addLoading = ref(false)
const onHandleClick = async (row) => {
  if (!row.isAdded) {
    addLoading.value = true
    await addAiAPI({ presetId: row.id })
    await sidebarStore.getSessions()
    addLoading.value = false
  }
  router.push(`/conversation/${row.id}`)
}

const showDetailModal = (row) => {
  viewForm.avatar = row.avatar
  viewForm.name = row.name
  viewForm.desc = row.descriptions
  viewForm.prompt = row.prompt
  visible.value = true
}

const visible = ref(false)
const viewForm = reactive({
  avatar: '',
  name: '',
  desc: '',
  prompt: ''
})

watch(() => queryParams.type, (id) => {
  const ele = document.getElementById(`nav-${id}`)
  if (ele) {
    ele.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest'
    })
  }
})

onUnmounted(() => {
  // document.querySelector('#main').removeEventListener('scroll', onScroll)
})
onMounted(() => {
  getCategory()
  // document.querySelector('#main').addEventListener('scroll', onScroll)

})
</script>

<template>
  <div class="find flex-column">
    <a-skeleton active :loading="state.table.loading" :paragraph="{ rows: 2, width: '100%' }">
      <div class="tabbar flex align-center justify-between">
        <div class="nav flex flex-1">
          <div class="item flex align-center" :id="`nav-${cate.id}`" :class="{ 'active': queryParams.type === cate.id }"
            v-for="cate in state.categorys" :key="cate.id" @click="changeCate(cate.id)">
            <span class="iconfont" :class="cate.icon"></span>
            <span class="name">{{ cate.label }}</span>
          </div>
        </div>
        <div class="search flex align-center">
          <a-input v-model:value="queryParams.searchKey" allowClear placeholder="搜索AI机器人"
            style="width: 160px;background: rgba(0,0,0,0.05);" @change="debouncedFn">
            <template #prefix>
              <search-outlined />
            </template>
          </a-input>
          <a-select size="default" v-model:value="queryParams.sort" style="width: 120px;margin-left: 12px;"
            @change="getTableRows">
            <a-select-option value="">综合排序</a-select-option>
            <a-select-option value="hot">热度排序</a-select-option>
            <a-select-option value="date">时间排序</a-select-option>
          </a-select>
        </div>
      </div>
    </a-skeleton>


    <div class="card-wrapper flex">
      <template v-if="state.table.rows.length > 0">
        <div class="card flex-column justify-between" v-for="item in state.table.rows" :key="item.id">
          <div class="info flex align-center">
            <img class="avatar" :src="baseUrl + item.avatar" alt="">
            <div class="name ellipsis">{{ item.name }}</div>
          </div>
          <div class="desc ellipsis2">{{ item.descriptions }}</div>
          <div class="mask flex-column justify-center align-center">
            <a-button :loading="addLoading" class="button flex justify-center align-center" style="border: none;"
              @click="onHandleClick(item)">{{ item.isAdded ? '开始聊天' : '添加机器人' }}</a-button>
            <div class="more flex align-center" @click="showDetailModal(item)">
              <img src="@/assets/images/community/more.png" alt="">
              <span>详情</span>
            </div>
          </div>
          <div v-if="item.isAdded" class="tag">
            <img src="@/assets/images/community/added.png" alt="">
          </div>
        </div>
      </template>
      <template v-else-if="!state.table.loading">
        <div style="width:100%;margin-top: 100px;">
          <Empty />
        </div>
      </template>
      <div v-if="!state.table.loading && state.table.rows.length > 0" class="load flex justify-center"
        @click="throttledFn">
        {{ state.loadText }}</div>
      <a-spin class="spin" :spinning="spinning"></a-spin>
    </div>
  </div>

  <a-modal centered class="modal" v-model:visible="visible" title="AI机器人详情" :footer="null">
    <a-form :model="viewForm" layout="vertical">
      <a-form-item label="头像" name="avatar">
        <div class="avatar flex align-center">
          <img :src="baseUrl + viewForm.avatar" alt="">
        </div>
      </a-form-item>

      <a-form-item label="昵称" name="name">
        <div class="name">{{ viewForm.name }}</div>
      </a-form-item>

      <a-form-item label="介绍" name="desc">
        <div class="desc">{{ viewForm.desc }}</div>
      </a-form-item>

      <a-form-item label="提示词" name="prompt">
        <div class="prompt">{{ viewForm.prompt }}</div>
      </a-form-item>
      <a-form-item :label-col="{ span: 24 }" style="margin-bottom: 0;">
        <div class="flex justify-end">
          <a-button size="large" type="primary" @click="visible = false">关闭</a-button>
        </div>

      </a-form-item>

    </a-form>
  </a-modal>
</template>

<style lang="less" scoped>
::v-deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
  background: rgba(0, 0, 0, 0.05);
}

.find {
  position: relative;
  height: 100%;
  overflow-x: hidden;


  .tabbar {
    margin-bottom: 20px;
    position: relative;

    .nav {
      overflow-x: auto;
      margin-right: 18px;

      // 滚动条样式
      &::-webkit-scrollbar {
        display: none;
      }


      .item {
        cursor: pointer;
        flex-shrink: 0;
        padding: 8px 12px;
        border-radius: 8px;
        color: rgba(0, 0, 0, 0.40);
        margin-right: 10px;

        &.active {
          background: rgba(50, 117, 243, 0.10);
          color: #3275F3;

        }

        .iconfont {
          transform: translateY(1px);
        }

        .name {
          margin-left: 4px;
          font-size: 15px;
          line-height: 18px;
        }
      }
    }
  }



  .card-wrapper {
    overflow-y: auto;
    flex-wrap: wrap;
    // margin-right: -6px;
    position: relative;

    // 滚动条样式
    &::-webkit-scrollbar {
      display: none;
    }

    .spin {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      z-index: 2023;
    }

    .card {
      margin-right: 16px;
      box-sizing: border-box;
      height: 134px;
      background: linear-gradient(180deg, #e9f0ff, #fefefe 100%);
      border: 1px solid #ffffff;
      border-radius: 12px;
      box-shadow: 0px 4px 8px 0px rgba(55, 99, 170, 0.07);
      padding: 20px;
      margin-bottom: 16px;
      position: relative;
      // overflow: hidden;

      &:hover .mask {
        display: flex;
      }

      .info {
        .avatar {
          width: 36px;
          height: 36px;
          background: #ffffff;
          border-radius: 8px;
          margin-right: 12px;
          border: 1px solid rgba(0, 0, 0, 0.10);
        }

        .name {
          font-size: 15px;
          font-weight: 700;
          color: #000000;
        }
      }

      .desc {
        font-size: 13px;
        color: rgba(0, 0, 0, 0.60);
        line-height: 21px;
      }

      .mask {
        position: absolute;
        background: rgba(0, 0, 0, 0.30);
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        backdrop-filter: blur(10px);
        border: 1px solid #3275f3;
        display: none;
        border-radius: 12px;


        .button {
          width: 113px;
          height: 39px;
          background: #3275f3;
          border-radius: 8px;
          font-size: 13px;
          color: #ffffff;
          margin-bottom: 25px;
          cursor: pointer;
        }

        .more {
          color: #ffffff;
          font-size: 13px;
          line-height: 15px;
          cursor: pointer;

          &>img {
            width: 16px;
            height: 16px;
            margin-right: 4px;
          }
        }
      }

      .tag {
        position: absolute;
        top: -3px;
        right: 0px;

        &>img {
          width: 70px;
          height: 20px;
        }
      }
    }
  }

  .load {
    width: 100%;
    margin-bottom: 10px;
    color: rgba(0, 0, 0, 0.60);
  }

}

.modal {
  .avatar {
    height: 88px;
    border: 1px solid rgba(0, 0, 0, 0.10);
    border-radius: 8px;
    padding: 12px;
    box-sizing: border;

    &>img {
      width: 64px;
      height: 64px;
      border-radius: 8px;
    }
  }

  .name,
  .desc,
  .prompt {
    border: 1px solid rgba(0, 0, 0, 0.10);
    border-radius: 8px;
    padding: 8px 12px;

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
  }

  .desc {
    max-height: 72px;
    overflow: auto;
  }

  .prompt {
    max-height: 114px;
    overflow: auto;
  }
}

@media screen and (max-width: 1439px) {
  .find {
    .card-wrapper {
      .card {
        width: 273px;

        &:nth-child(3n) {
          margin-right: 0;
        }
      }
    }
  }
}

@media screen and (min-width:1440px) and (max-width:1679px) {
  .find {
    .card-wrapper {
      .card {
        width: 293px;

        &:nth-child(3n) {
          margin-right: 0;
        }
      }
    }
  }
}

@media screen and (min-width: 1680px) and (max-width:1919px) {
  .find {
    .card-wrapper {
      .card {
        width: 264px;

        &:nth-child(4n) {
          margin-right: 0;
        }
      }
    }
  }
}

@media screen and (min-width: 1920px) {
  .find {
    .card-wrapper {
      .card {
        width: 280px;

        &:nth-child(5n) {
          margin-right: 0;
        }
      }
    }
  }

}
</style>