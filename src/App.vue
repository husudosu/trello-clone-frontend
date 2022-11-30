<template>
  <router-view></router-view>
</template>

<script lang="ts" setup>
import store from "@/store";
import { useQuasar } from "quasar";

const $q = useQuasar();
$q.loading.show({ delay: 140 });
store.dispatch.auth.getUserClaims().then(async () => await store.dispatch.board.loadBoards())
  .finally(() => $q.loading.hide());
</script>
