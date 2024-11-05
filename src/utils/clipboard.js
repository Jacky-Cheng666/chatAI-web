/**
 * @Description: 
 * @Author: chengwm
 * @Date: 2023-04-10 15:22:43
 * @LastEditors: chengwm
 * @LastEditTime: 2023-04-10 15:23:11
 */
import Clipboard from 'clipboard'
import { message } from 'ant-design-vue'

function clipboardSuccess() {
  message.success({
    content: '内容已复制到剪贴板！',
    duration: 3
  })
}

function clipboardError() {
  message.error({
    content: '复制失败！',
    duration: 3
  })
}

export default function handleClipboard(text, event) {
  const clipboard = new Clipboard(event.target, {
    text: () => text
  })
  clipboard.on('success', () => {
    clipboardSuccess()
    clipboard.destroy()
  })
  clipboard.on('error', () => {
    clipboardError()
    clipboard.destroy()
  })
  clipboard.onClick(event)
}
