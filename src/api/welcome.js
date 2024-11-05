import request from '@/utils/request'
const appType = import.meta.env.VITE_APP_TYPE

/**
 * @description 获取推荐机器人列表
 * @param {number | string} page -页码
 * @param {number | string} size -页容量
 * @param {string} sort -分类  排序类型，不传为【综合排序】，hot为【热度排序】，date为【时间排序】
 * @returns 
 */
export function welcomeListAPI({ page = 1, size = 20, sort }) {
  return request({
    url: `/api/${appType}/presets`,
    method: 'get',
    params: { page, size, sort }
  })
}