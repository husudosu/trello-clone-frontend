<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated>
            <q-toolbar>
                <q-toolbar-title>
                    Yamakanban
                </q-toolbar-title>
                <q-btn-dropdown icon="person" flat v-if="!$q.screen.xs">
                    <q-list>
                        <q-item>
                            <q-item-section top avatar>
                                <q-avatar rounded>
                                    <user-avatar :user="authStore.user" size="md"></user-avatar>
                                </q-avatar>
                            </q-item-section>

                            <q-item-section>
                                <q-item-label>{{ user?.username }}</q-item-label>
                            </q-item-section>

                        </q-item>
                        <q-separator></q-separator>
                        <q-item clickable v-close-popup :to="{ name: 'user', params: { userId: user?.id } }">
                            <q-item-section side>
                                <q-icon name="person"></q-icon>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>Details</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="onLogoutClicked">
                            <q-item-section side>
                                <q-icon name="logout"></q-icon>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>Logout</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>

                </q-btn-dropdown>

            </q-toolbar>
            <q-toolbar>
                <q-btn-dropdown icon="developer_board" flat label="Boards">
                    <q-list>
                        <q-item clickable v-close-popup @click="onNewBoardClicked">
                            <q-item-section side>
                                <q-icon name="add"></q-icon>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>New board</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-item clickable v-close-popup @click="onArchivedBoardsClicked">
                            <q-item-section side>
                                <q-icon name="archive"></q-icon>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>Archived</q-item-label>
                            </q-item-section>
                        </q-item>
                        <q-separator></q-separator>
                        <q-item clickable v-close-popup v-for="board in boards" :key="board.id"
                            :to="{ name: 'board', params: { boardId: board.id } }">
                            <q-item-section side>
                                <q-icon name="developer_board"></q-icon>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>{{ board.title }}</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>

                </q-btn-dropdown>
            </q-toolbar>
        </q-header>

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
import { useQuasar } from 'quasar';
import { BoardAPI } from '@/api/board';

import NewBoardDialog from '@/components/Board/NewBoardDialog.vue';
import ArchivedBoardsDialog from '@/components/Board/ArchivedBoardsDialog.vue';
import UserAvatar from '@/components/UserAvatar.vue';
import { IBoard } from '@/api/types';
const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const boardStore = useBoardStore();

const boards = computed(() => boardStore.boards);
const user = computed(() => authStore.user);
const onLogoutClicked = () => {
    authStore.doLogout().then(() => router.push({ name: "login" }));
};

const onNewBoardClicked = () => {
    $q.dialog({
        component: NewBoardDialog
    }).onOk(async (payload: Partial<IBoard>) => {
        const newBoard = await BoardAPI.postBoard(payload);
        boardStore.boards.push(newBoard);
        router.push({ name: "board", params: { boardId: newBoard.id } });
    });
};

const onArchivedBoardsClicked = () => {
    $q.dialog({
        component: ArchivedBoardsDialog
    });
};



</script>
