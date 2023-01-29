<template>
    <q-layout view="lHh Lpr lFf">
        <q-header elevated>
            <q-toolbar>
                <q-toolbar-title>
                    Yamakanban
                </q-toolbar-title>

                <q-btn v-if="$q.screen.xs && board" flat dense round aria-label="Board menu" icon="more_vert">
                    <q-menu>
                        <q-list>
                            <q-item clickable v-close-popup @click="onBoardDetailsClicked">
                                <q-item-section>Board details</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
                <q-btn-dropdown icon="developer_board" flat v-if="!$q.screen.xs">
                    <q-list>
                        <q-item clickable v-close-popup>
                            <q-item-section side>
                                <q-icon name="add"></q-icon>
                            </q-item-section>
                            <q-item-section>
                                <q-item-label>New board</q-item-label>
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
                <q-btn-dropdown icon="person" flat v-if="!$q.screen.xs">
                    <q-list>
                        <q-item>
                            <q-item-section top avatar>
                                <q-avatar rounded>
                                    <img src="https://cdn.quasar.dev/img/boy-avatar.png">
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
            <div class="q-pa-sm q-pl-md row items-center">
                <span class="text-subtitle1">{{ board?.title }}</span>
                <q-space></q-space>
                <q-btn v-if="!$q.screen.xs" flat icon="add" align="between" label="List" @click="onNewListClicked"
                    size=sm text-color="light-green-3"></q-btn>
                <q-btn v-if="!$q.screen.xs" flat icon="info" align="between" label="Board details"
                    @click="onBoardDetailsClicked" size=sm></q-btn>

            </div>
        </q-header>
        <q-page-container>
            <router-view></router-view>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import BoardDetailsDialogVue from '@/components/Board/DetailsDialog/BoardDetailsDialog.vue';
import { useAuthStore } from '@/stores/auth';
import { useBoardStore } from '@/stores/board';
import NewBoardListDialog from '@/components/Board/List/NewBoardListDialog.vue';
import { IDraftBoardList } from '@/api/types';
import { BoardListAPI } from '@/api/boardList';

const router = useRouter();
const authStore = useAuthStore();
const boardStore = useBoardStore();

const boards = computed(() => boardStore.boards);
const board = computed(() => boardStore.board);

const $q = useQuasar();


const user = computed(() => authStore.user);
const onLogoutClicked = () => {
    authStore.doLogout().then(() => { router.push({ name: "login" }); console.log("login screen"); });
};

const onBoardDetailsClicked = () => {
    $q.dialog({
        component: BoardDetailsDialogVue
    });
};

const onNewListClicked = () => {
    $q.dialog({
        component: NewBoardListDialog
    }).onOk((newList: IDraftBoardList) => {
        if (board.value) {
            BoardListAPI.postBoardList(board.value?.id, newList);
        }
    });
};
</script>
