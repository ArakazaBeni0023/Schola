import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/Pages/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/auth/login',
    meta: {
      name: 'Se connecter |',
    },
    component: () => import('../views/auth/LoginView.vue')
  },
  {
    path: '/notifications',
    meta: {
      name: 'Notifications|',
    },
    component: () => import('../views/Pages/NotificationsView.vue')
  },  
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to) => {
  document.title = to.meta?.name ?? 'Schola'
});

export default router
