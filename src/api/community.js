import request from '@/utils/request'
const appType = import.meta.env.VITE_APP_TYPE

/**
 * @description 获取AI分类
 */
export function getCategoryAPI() {
  return request({
    url: `/api/${appType}/presets/types`,
    method: 'get'
  })
}

/**
 * @description AI广场列表
 * @param {number} page 页码
 * @param {number} size 页容量
 * @param {string} type 分类
 * @param {string} sort 排序  
 * @param {string} searchKey 关键字 
 */

export function systemRobotsAPI({ page, size, type, sort, searchKey }) {
  type = type || undefined
  return request({
    url: `/api/${appType}/presets/auth`,
    method: 'get',
    params: { page, size, type, sort, searchKey }
  })
}

/**
 * @description 添加AI广场机器人为我的AI
 * @param {string} presetId 机器人的id
 * @returns 
 */
export function addAiAPI({ presetId }) {
  return request({
    url: `/api/${appType}/presets/users/addition`,
    method: 'post',
    data: { presetId }
  })
}

/**
 * @description 获取我添加机器人列表
 * @param {string} sort 排序字段  time时间排序 name名称排序
 */
export function myListAPI(sort) {
  return request({
    url: `/api/${appType}/presets/users/addition`,
    method: 'get',
    params: { sort }
  })
}

/**
 * @description 获取我创建的机器人列表
 * @param {string} sort 排序字段  time时间排序 name名称排序
 */
export function createListAPI(sort) {
  return request({
    url: `/api/${appType}/presets/users`,
    method: 'get',
    params: { sort }
  })
}

/**
 * @description 删除我的AI（包含我添加的和我创建的）
 * @param {string} presetId 机器人id
 */
export function deleteAiAPI(presetId) {
  return request({
    url: `/api/${appType}/presets/users`,
    method: 'delete',
    data: { presetId }
  })
}