import axios from 'axios';
import { useUserStore } from '@/stores/user'
import { useSidebarStore } from '@/stores/sidebar'
import { message } from 'ant-design-vue'
// 配置新建一个 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 50000
});

const dispos = { lock: false, queu: [] }

// 添加请求拦截器
service.interceptors.request.use(
  (config) => {
    const userStore = useUserStore()
    const token = userStore.accessToken
    // 在发送请求之前做些什么 token
    if (token) {
      config.headers['Authorization'] = token;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const res = response.data;
    if (res.errcode != 0) {
      message.error({
        content: res.message || 'Error',
        duration: 5
      })
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return response.data;
    }
  },
  async error => {
    const userStore = useUserStore()
    const sidebarStore = useSidebarStore()
    // 对响应错误做点什么
    if (error.message.indexOf('timeout') != -1) {
      message.error('网络超时');
    } else if (error.message == 'Network Error') {
      message.error('网络连接错误');
    } else {
      if (error.response.data) {
        const { errcode, errmsg } = error.response.data
        if (!['50001', '50002', '50003', '50004', '50005', '43000'].includes(errcode)) {
          message.error({
            content: errmsg || 'Error',
            duration: 5
          })
        }
        if (['50001', '50003'].includes(errcode)) {
          if (dispos.lock) {
            return new Promise(resolve => dispos.queu.push(() => resolve(service(error.response.config))))
          } else {
            try {
              dispos.lock = true
              await userStore.refreshToken()
              dispos.lock = false
              dispos.queu.forEach(cb => cb())
              dispos.queu = []
              return service(error.response.config);
            } catch (err) {
              userStore.clear()
              sidebarStore.clearSession()
              window.location.reload()
            }
          }
        }
      } else {
        message.error('接口路径找不到');
      }
    }
    return Promise.reject(error);
  }
);

// 导出 axios 实例
export default service;
