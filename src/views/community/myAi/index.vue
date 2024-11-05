
<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { myListAPI, createListAPI, deleteAiAPI } from '@/api/community'
import router from '@/router'
import empty from '@/components/Empty/index.vue'
const showCreateModal = () => alert('开发中')
const tabs = [{ name: '我添加的', id: 1 }, { name: '我创建的', id: 2 }]
const activeTab = ref(1)
const tabChange = ({ id }) => {
  activeTab.value = id
  getTableRows()
}
const queryParams = reactive({
  sort: ''
})
const baseUrl = computed(() => import.meta.env.VITE_API_URL)
const table = reactive({
  rows: [],
  loading: false
})
const getTableRows = async () => {
  table.loading = true
  const { list } = activeTab.value === 1 ? await myListAPI(queryParams.sort) : await createListAPI({ sort: queryParams.sort })
  table.loading = false
  table.rows = list
}
const onHandleClick = (item) => {
  router.push(`/conversation/${item.id}`)
}
const showDetailModal = () => {
  alert('开发中')
}
const handleDelete = () => {
  alert('开发中')
}
onMounted(() => {
  getTableRows()
})

</script>
<template>
  <div class="container">
    <div class="penel">
      <div class="item flex-column align-center justify-center" @click="showCreateModal">
        <img class="icon" src="@/assets/images/community/icon-robot.png" alt="">
        <div class="text">创建AI机器人</div>
      </div>
    </div>
    <div class="menu flex align-center justify-between">
      <div class="tabs flex align-center">
        <div class="tab flex justify-center align-center" :class="{ active: activeTab === tab.id }"
          v-for="(tab, index) in tabs" :key="index" @click="tabChange(tab)">{{ tab.name }}</div>
      </div>
      <div class="search">
        <a-select size="default" v-model:value="queryParams.sort" style="width: 120px;margin-left: 12px;"
          @change="getTableRows">
          <a-select-option value="">默认排序</a-select-option>
          <a-select-option value="name">名称排序</a-select-option>
          <a-select-option value="time">时间排序</a-select-option>
        </a-select>
      </div>
    </div>
    <a-spin :spinning="table.loading">
      <template v-if="table.rows.length > 0">
        <div class="card-wrapper flex">
          <div class="card flex-column justify-between" v-for="item in table.rows" :key="item.id">
            <div class="info flex align-center">
              <img class="avatar" :src="baseUrl + item.avatar" alt="">
              <div class="name ellipsis">{{ item.name }}</div>
            </div>
            <div class="desc ellipsis2">{{ item.descriptions }}</div>
            <div class="mask flex-column justify-center align-center">
              <a-button class="button flex justify-center align-center" style="border: none;"
                @click="onHandleClick(item)">开始聊天</a-button>
              <div class="flex align-center">
                <div class="more flex align-center" @click="showDetailModal(item)" style="margin-right: 60px;">
                  <img src="@/assets/images/community/more.png" alt="">
                  <span>详情</span>
                </div>
                <div class="more flex align-center" @click="handleDelete(item)">
                  <img src="@/assets/images/community/more.png" alt="">
                  <span>删除</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div style="margin-top: 100px;">
          <empty />
        </div>
      </template>
    </a-spin>
  </div>
</template>

<style lang="less" scoped>
::v-deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector) {
  background: rgba(0, 0, 0, 0.05);
}

.container {
  overflow-x: hidden;

  // 隐藏滚动条
  &::-webkit-scrollbar {
    display: none;
  }

  .penel {
    margin-bottom: 40px;

    .item {
      width: 280px;
      height: 134px;
      background: rgba(0, 0, 0, 0.02);
      border: 1px solid rgba(0, 0, 0, 0.10);
      border-radius: 12px;
      cursor: pointer;

      .icon {
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
      }

      .text {
        font-size: 15px;
        color: #666666;
        line-height: 18px;
      }
    }
  }

  .menu {
    margin-bottom: 18px;

    .tabs {
      .tab {
        width: 84px;
        height: 34px;
        background-color: #fff;
        border-radius: 8px;
        font-size: 15px;
        margin-right: 12px;
        cursor: pointer;
        transition: all .3s;

        &.active {
          background: rgba(50, 117, 243, 0.10);
          font-weight: 700;
          color: #3275f3;
        }
      }
    }
  }

  .card-wrapper {
    height: 100%;
    flex-wrap: wrap;
    position: relative;



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
}

@media screen and (max-width: 1439px) {
  .container {
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
  .container {
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
  .container {
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
  .container {
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