import request from '@/utils/request'
const appType = import.meta.env.VITE_APP_TYPE
/**
 * @description 价格列表
 */
export function rightsAPI() {
  return request({
    url: `/api/${appType}/rights`,
    method: 'get'
  })
}

/**
 * @description 商品下单
 * @param {number} rights_id 商品id
 */
export function transactionAPI(rights_id) {
  return request({
    url: `/api/${appType}/native/transactions`,
    method: 'post',
    data: { rights_id }
  })
}

/**
 * @description 查询订单状态
 * @param {string} out_trade_no 订单号
 */
export function payStatusAPI(out_trade_no) {
  return request({
    url: `/api/${appType}/check/pay`,
    method: 'post',
    data: { out_trade_no }
  })
}

/**
 * @description 关闭订单
 * @param {string} out_trade_no 订单号
 */
export function closePayAPI(out_trade_no) {
  return request({
    url: `/api/${appType}/close/pay`,
    method: 'delete',
    data: { out_trade_no }
  })
}
