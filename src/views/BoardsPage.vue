
<template>
    <div class="q-mt-lg q-ma-sm shadow-1">
        <!-- Edit board dialog -->
        <q-dialog v-model="showBoardDialog">
            <q-card style="width: 400px;">
                <q-card-section>
                    <q-toolbar color="primary">
                        <q-toolbar-title>Create new board</q-toolbar-title>
                        <q-btn flat round dense icon="close" v-close-popup />
                    </q-toolbar>
                </q-card-section>
                <form @submit.prevent.stop="onBoardSave" class="q-gutter-md">
                    <q-card-section>
                        <q-input ref="titleRef" v-model="newBoard.title" label="Title *" hint="Title of board"
                            lazy-rules :rules="[val => val && val.length > 0 || 'Title is required']" />
                    </q-card-section>
                    <q-card-actions class="form_actions" align="right">
                        <q-btn type="submit" color="primary" class="full-width">Create</q-btn>
                    </q-card-actions>

                </form>
            </q-card>
        </q-dialog>
        <!-- Board list code -->
        <ul class="flex q-gutter-md wrap content-center q-pa-md">
            <li class="flex shadow-1 boardCard non-selectable" v-for="board in boards" :key="board.id"
                @click="onBoardClick(board.id)">
                {{ board.title }}
            </li>
            <li class="flex shadow-1 boardCard text-weight-bold non-selectable" @click="showBoardDialog = true">Create
                new board</li>
        </ul>

        <!-- Archived  boards  code -->
        <template v-if="archivedBoards.length > 0">
            <span class="text-h5">Archived boards</span>
            <ul class="flex q-gutter-md wrap content-center q-pa-md">
                <li class="flex shadow-1 boardCard non-selectable" v-for="board in archivedBoards" :key="board.id"
                    @click="onBoardClick(board.id)">
                    {{ board.title }}
                </li>
            </ul>
        </template>
    </div>
</template>


<script lang="ts" setup>
import { BoardAPI } from '@/api/board';
import { IBoard } from '@/api/types.js';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useBoardStore } from '@/stores/board';
const boardStore = useBoardStore();

const boards = computed(() => boardStore.boards);
const router = useRouter();
const showBoardDialog = ref(false);
const newBoard = ref<Partial<IBoard>>({
    title: ""
});

const titleRef = ref();

const archivedBoards = ref<IBoard[]>([]);

const onBoardClick = (boardId: number) => {
    router.push({
        name: "board",
        params: { boardId: boardId }
    });
};

const onBoardSave = () => {
    titleRef.value.validate();
    if (!titleRef.value.hasError) {
        boardStore.createBoard(newBoard.value).then((resp: IBoard) => {
            showBoardDialog.value = false;
            router.push({ name: "board", params: { boardId: resp.id } });
        });
    }
};

onMounted(async () => {
    archivedBoards.value = await BoardAPI.getArchivedBoards();
})

</script>

<style scoped>
.boardCard {
    list-style-type: none;
    height: 100px;
    width: 150px;
    padding: 16px 16px;
}

.form_actions button {
    width: 100px;
}
</style>