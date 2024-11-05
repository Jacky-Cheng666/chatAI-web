import { defineStore } from 'pinia'
import { recentMsgAPI, recentFileAPI } from '@/api/sidebar'
import doc from '@/assets/images/analysis/icon-doc.png'
import txt from '@/assets/images/analysis/icon-text.png'
import pdf from '@/assets/images/analysis/icon-pdf.png'
import html from '@/assets/images/analysis/icon-html.png'
export const useSidebarStore = defineStore('sidebar', {
  state: () => ({
    // 最近聊天会话列表
    sessions: [],
    // 最近上传的文件列表
    fileList: [],
    // 是否显示充值组件
    showPrice: false
  }),
  actions: {
    async getSessions() {
      const { list } = await recentMsgAPI()
      this.sessions = list
    },
    async getRecentFileList({ key, sort }) {
      const iconMap = {
        DOC: doc,
        PDF: pdf,
        HTML: html,
        TXT: txt
      }
      const { list } = await recentFileAPI({ key, sort })
      this.fileList = list.map(t => {
        return {
          id: t.id,
          name: t.docName,
          updatedAt: t.createdAt,
          msgCount: t.msgCount,
          avatar: iconMap[t.docType]
        }
      })
    },
    // 更新消息条数
    updateSessionCount(id) {
      const item = this.sessions.find(t => t.id === id)
      if (item) {
        let oldCount = item.msgCount || 0
        item.msgCount = oldCount + 1
      }
    },
    // 更新文档消息条数
    updateFileCount(id) {
      const item = this.fileList.find(t => t.id === id)
      if (item) {
        let oldCount = item.msgCount || 0
        item.msgCount = oldCount + 1
      }
    },
    clearSession() {
      this.sessions = []
    },
    openPriceModal() {
      this.showPrice = true
    },
    closePriceModal() {
      this.showPrice = false
    }
  },
  getters: {}
})