import request from '@/utils/request'
const appType = import.meta.env.VITE_APP_TYPE
/**
 * @description 我的会话列表
 */
export function recentMsgAPI() {
  return request({
    url: `/api/${appType}/records/presets`,
    method: 'get'
  })
}

/**
 * @description 获取我的文件上传列表
 * @param {string} key 关键字
 * @param {string} sort 排序  time：按照时间排序  name：按照名称排序
 * @returns 
 */
export function recentFileAPI({ key, sort }) {
  return request({
    url: `/api/${appType}/docs`,
    method: 'get',
    params: { key, sort }
  })
}
/**
 * @description 删除会话
 * @param {string} presetId 会话id
 * @returns 
 */
export function delSessionAPI({ presetId }) {
  return request({
    url: `/api/${appType}/records/presets/${presetId}`,
    method: 'delete'
  })
}

/**
 * @description 删除文件
 * @param {string} docId  文档id
 */
export function delFileAPI(docId) {
  return request({
    url: `/api/web/docs/${docId}`,
    method: 'delete',
  })
}