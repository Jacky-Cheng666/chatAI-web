import { createRouter, createWebHistory } from 'vue-router'
import layout from '@/layout/index.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'layout',
      component: layout,
      redirect: '/welcome',
      children: [
        {
          path: 'welcome',
          component: () => import('@/views/chat/welcome/index.vue')
        },
        {
          path: 'conversation/:id',
          component: () => import('@/views/chat/conversion/index.vue')
        },
        {
          path: 'document/:id',
          component: () => import('@/views/analysis/conversation/index.vue'),
          meta: { analysis: true }
        },
        {
          path: 'upload',
          component: () => import('@/views/analysis/upload/index.vue'),
          meta: { analysis: true }
        },
        {
          path: 'mine',
          component: () => import('@/views/mine/index.vue')
        },
        {
          path: 'community',
          component: () => import('@/views/community/index.vue'),
          redirect: '/community/find',
          children: [
            {
              path: 'find',
              component: () => import('@/views/community/findAi/index.vue')
            },
            {
              path: 'my',
              component: () => import('@/views/community/myAi/index.vue')
            }
          ]
        }
      ]
    },
    {
      path: '/wxlogin',
      component: () => import('@/views/auth/wxLogin/index.vue')
    },
    {
      path: '/wxbind',
      component: () => import('@/views/auth/wxBind/index.vue')
    },
    {
      path: '/404',
      component: () => import('@/views/404.vue')
    },
    { path: '/:pathMatch(.*)*', redirect: '/404' }
  ]
})

export default router
