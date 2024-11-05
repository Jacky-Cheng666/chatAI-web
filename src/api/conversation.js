import request from '@/utils/request'
const appType = import.meta.env.VITE_APP_TYPE
/**
 * @description 获取和该机器人的聊天记录
 * @param {string} presetId 机器人的id
 * @param {Date} endDate 第一条消息记录的时间
 */
export function msgHistoryAPI({ presetId, endDate }) {
  return request({
    url: `/api/${appType}/records/chatting/${presetId}`,
    method: 'get',
    params: { endDate }
  })
}

/**
 * @description 获取机器人详细信息
 * @param {string} presetId  机器人的id
 */
export function robotInfoAPI({ presetId }) {
  return request({
    url: `/api/${appType}/presets/detail`,
    method: 'get',
    params: { presetId }
  })
}
/**
 * @description 清空聊天记录
 * @param {string} presetId 
 * @returns 
 */
export function clearHistoryAPI({ presetId }) {
  return request({
    url: `/api/web/records/chatting/${presetId}`,
    method: 'delete'
  })
}