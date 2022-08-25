import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "board",
    component: () => import("../views/BoardPage.vue")
  },
  {
    path: "/board/:boardId",
    name: "board",
    component: () => import("../views/BoardPage.vue")
  }, {
    path: "/board",
    name: "boards",
    component: () => import("../views/BoardsPage.vue")
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginPage.vue"),
    meta: { only_anonymous: true }
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/RegisterPage.vue"),
    meta: { only_anonymous: true }
  },
  {
    path: "/user/view/:userId",
    name: "user",
    component: () => import("../views/UserPage.vue"),
  },
  {
    path: "/500",
    name: "500",
    component: () => import("../views/InternalServerErrorPage.vue"),
  },
  {
    path: "/404",
    name: "404",
    component: () => import("../views/PageNotFound.vue"),
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
