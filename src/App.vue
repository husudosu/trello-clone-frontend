<template>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
import { useAuthStore } from "./stores/auth";
import { useBoardStore } from "./stores/board";

const $q = useQuasar();
const authStore = useAuthStore();
const boardStore = useBoardStore();

$q.loading.show({ delay: 140 });
authStore.getUserClaims().then(async () => await boardStore.loadBoards())
  .finally(() => $q.loading.hide());
</script>
