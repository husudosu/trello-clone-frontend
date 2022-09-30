<template>
  <template v-if="loggedIn">
    <user-area-layout></user-area-layout>
  </template>
  <template v-else>
    <empty-layout></empty-layout>
  </template>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import store from "@/store";

import EmptyLayout from "./layouts/EmptyLayout.vue";
import UserAreaLayout from "./layouts/UserAreaLayout.vue";

const loggedIn = computed(() => store.state.auth.loggedIn);
store.dispatch.auth.getUserClaims()
  .then(() => {
    store.dispatch.board.loadBoards();
  });

</script>
