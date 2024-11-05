import request from '@/utils/request'
const appType = import.meta.env.VITE_APP_TYPE
import bus from '@/utils/bus'
/**
 * @description 上传文档
 */
export function document(file) {
  const fd = new FormData()
  fd.append('file', file)
  return request({
    url: `/api/${appType}/docs`,
    method: 'post',
    data: fd,
    onUploadProgress: (e) => {
      // 文件上传进度回调
      bus.emit('progress', (e.loaded / e.total) * 100)
    }
  })
}
/**
 * @description 获取文档消息历史记录
 * @param {string} docId 文档id 
 * @param {Date} endDate 第一条消息记录的时间
 * @returns 
 */
export function docHistoryAPI({ docId, endDate }) {
  return request({
    url: `/api/${appType}/records/docs/${docId}`,
    method: 'get',
    params: { endDate }
  })
}

/**
 * @description 清空文档记录
 * @param {string} docId 文档id
 */
export function clearHistoryAPI(docId) {
  return request({
    url: `/api/${appType}/records/docs/${docId}`,
    method: 'delete'
  })
}