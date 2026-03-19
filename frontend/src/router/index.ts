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
  // Check both store and localStorage (store may not be updated yet in same tick)
  const hasToken = auth.token || localStorage.getItem('token');
  if (to.meta.requiresAuth && !hasToken) {
    next({ name: 'Login' });
    return;
  }
  next();
});

export default router;
