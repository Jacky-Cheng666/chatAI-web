import router from "@/router"
import { useUserStore } from '@/stores/user'
import { useNavbarStore } from '@/stores/navbar'
const whiteList = ['/welcome', '/wxbind', '/wxlogin']

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const navbarStore = useNavbarStore()
  if (userStore.isLogin) {
    next()
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next()
    } else {
      next('/welcome')
      navbarStore.openLogin()
    }
  }
})