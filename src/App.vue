<template>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import { useQuasar } from "quasar";
import { useAuthStore } from "./stores/auth";
import { useBoardStore } from "./stores/board";

const $q = useQuasar();
$q.loading.show({ delay: 140 });
const authStore = useAuthStore();
const boardStore = useBoardStore();

authStore.getUserClaims().then(async () => await boardStore.loadBoards())
  .finally(() => $q.loading.hide());
</script>
