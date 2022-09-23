<template>
  <template v-if="!loggedIn">
    <empty-layout></empty-layout>
  </template>
  <template v-else>
    <user-area-layout></user-area-layout>
  </template>
</template>

<script lang="ts" setup>
import { computed } from "vue";

import store from "@/store";

import EmptyLayout from "./layouts/EmptyLayout.vue";
import UserAreaLayout from "./layouts/UserAreaLayout.vue";
import { io } from "socket.io-client";
const loggedIn = computed(() => store.state.auth.loggedIn);



store.dispatch.auth.getUserClaims()
  .then(() => {
    store.dispatch.board.loadBoards();
    // NOTE: This only temp code, gonna be deleted!
    const socket = io(process.env.VUE_APP_SOCKET_SERVER);
    socket.on('connect', () => {
      console.log("Connect");
      socket.emit("board_change", { board_id: 1 });

    });
  });

</script>
