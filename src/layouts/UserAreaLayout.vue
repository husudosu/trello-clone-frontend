<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated>
            <q-toolbar>
                <q-btn flat dense round @click="leftDrawerOpen = !leftDrawerOpen" aria-label="Menu" icon="menu" />
                <q-toolbar-title>
                    Yamakanban
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
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useBoardStore } from '@/stores/board';

const router = useRouter();
const authStore = useAuthStore();
const boardStore = useBoardStore();

const boards = computed(() => boardStore.boards);
const leftDrawerOpen = ref(false);

const user = computed(() => authStore.user);
const onLogoutClicked = () => {
    authStore.doLogout().then(() => { router.push({ name: "login" }); console.log("login screen"); });
};


</script>
