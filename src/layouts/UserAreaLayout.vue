<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated class="glossy">
            <q-toolbar>
                <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu" icon="menu" />

                <q-toolbar-title>
                    Trello clone
                </q-toolbar-title>
            </q-toolbar>
        </q-header>

        <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="bg-grey-2">
            <q-list>
                <q-item-label header>Welcome {{ user?.name || user?.username }} </q-item-label>
                <q-item clickable :to="{ name: 'user', params: { userId: user?.id } }">
                    <q-item-section avatar>
                        <q-icon name="person" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Profile</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item clickable :to="{ name: 'boards' }">
                    <q-item-section avatar>
                        <q-icon name="developer_board" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Boards</q-item-label>
                    </q-item-section>
                </q-item>
                <q-item clickable @click="onLogoutClicked">
                    <q-item-section avatar>
                        <q-icon name="logout" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>Logout</q-item-label>
                    </q-item-section>
                </q-item>
                <q-separator spaced inset />
                <q-item :to="{ name: 'board', params: { boardId: board.id } }" clickable v-for="board in boards"
                    :key=board.id>
                    <q-item-section avatar>
                        <q-icon name="developer_board" />
                    </q-item-section>
                    <q-item-section>
                        <q-item-label>{{ board.title }}</q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </q-drawer>

        <q-page-container>
            <router-view></router-view>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import store from "../store";
import { useRouter } from 'vue-router';

const router = useRouter();
const boards = computed(() => store.state.board.boards);
const leftDrawerOpen = ref(false);

const user = computed(() => store.state.auth.user);
const onLogoutClicked = () => {
    store.dispatch.auth.doLogout().then(() => router.push({ name: "login" }));
};

</script>
