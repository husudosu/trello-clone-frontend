<template>
  <template v-if="!loading && loggedIn">
    <user-area-layout></user-area-layout>
  </template>
  <template v-else-if="!loading">
    <empty-layout></empty-layout>
  </template>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";

import store from "@/store";

import EmptyLayout from "./layouts/EmptyLayout.vue";
import UserAreaLayout from "./layouts/UserAreaLayout.vue";
import { useQuasar } from "quasar";

const $q = useQuasar();
const loggedIn = computed(() => store.state.auth.loggedIn);
const loading = ref(true);

$q.loading.show({ delay: 140 });
store.dispatch.auth.getUserClaims().then(async () => await store.dispatch.board.loadBoards())
  .finally(() => { $q.loading.hide(); loading.value = false; });
</script>
