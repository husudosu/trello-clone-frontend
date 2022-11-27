import { createRouter, createWebHistory, RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from "vue-router";
import store from "@/store";


const onlyAnonymousCanAccess = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (store.state.auth.loggedIn) next({ name: "boards" });
  else next();
};

const onlyUserCanAccess = (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (store.state.auth.loggedIn) next();
  else next({ name: "login" });
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    redirect: { name: "boards" }
  },
  {
    path: "/board/:boardId",
    name: "board",
    component: () => import("../views/BoardPage.vue"),
    beforeEnter: onlyUserCanAccess,
  }, {
    path: "/board",
    name: "boards",
    component: () => import("../views/BoardsPage.vue"),
    beforeEnter: onlyUserCanAccess
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../views/LoginPage.vue"),
    meta: { only_anonymous: true },
    beforeEnter: onlyAnonymousCanAccess
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../views/RegisterPage.vue"),
    meta: { only_anonymous: true },
    beforeEnter: onlyAnonymousCanAccess
  },
  {
    path: "/user/view/:userId",
    name: "user",
    component: () => import("../views/UserPage.vue"),
    beforeEnter: onlyUserCanAccess
  }, {
    path: "/user/edit/:userId",
    name: "user.edit",
    component: () => import("../views/EditUserPage.vue"),
    beforeEnter: onlyUserCanAccess
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
    path: "/403",
    name: "403",
    component: () => import("../views/ForbiddenPage.vue"),
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
