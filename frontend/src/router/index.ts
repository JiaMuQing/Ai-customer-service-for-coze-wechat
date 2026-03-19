import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { public: true } },
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/group-binding' },
        { path: 'group-binding', name: 'GroupBinding', component: () => import('@/views/GroupBinding.vue') },
        { path: 'session', name: 'Session', component: () => import('@/views/Session.vue') },
      ],
    },
  ],
});

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore();
  if (to.meta.public) {
    next();
    return;
  }
  if (to.meta.requiresAuth && !auth.token) {
    next({ name: 'Login' });
    return;
  }
  next();
});

export default router;
