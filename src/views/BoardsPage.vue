
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
            <li class="flex shadow-1 board" v-for="board in boards" :key="board.id" @click="onBoardClick(board.id)">
                {{ board.title }}
            </li>
            <li class="flex shadow-1 board text-weight-bold" @click="showBoardDialog = true">Create new board</li>
        </ul>
    </div>
</template>


<script lang="ts" setup>
import { Board } from '@/api/types.js';
import store from '@/store/';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const boards = computed(() => store.state.board.boards);
const router = useRouter();
const showBoardDialog = ref(false);
const newBoard = ref<Partial<Board>>({
    title: ""
});

const titleRef = ref();

const onBoardClick = (boardId: number) => {
    router.push({
        name: "board",
        params: { boardId: boardId }
    });
};

const onBoardSave = () => {
    titleRef.value.validate();
    if (!titleRef.value.hasError) {
        store.dispatch.board.createBoard(newBoard.value).then((resp: Board) => {
            showBoardDialog.value = false;
            router.push({ name: "board", params: { boardId: resp.id } });
        });
    }
};
</script>

<style>
.board {
    list-style-type: none;
    height: 100px;
    width: 150px;
    padding: 16px 16px;

    /* Disabling  text selection for cards */
    -webkit-touch-callout: none;
    /* iOS Safari */
    -webkit-user-select: none;
    /* Safari */
    -khtml-user-select: none;
    /* Konqueror HTML */
    -moz-user-select: none;
    /* Old versions of Firefox */
    -ms-user-select: none;
    /* Internet Explorer/Edge */
    user-select: none;
    /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}

.form_actions button {
    width: 100px;
}
</style>