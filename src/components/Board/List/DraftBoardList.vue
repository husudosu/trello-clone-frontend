<template>
    <div class="listWrapper">
        <div class="list">
            <header class="listHeader">
                <q-input v-model="boardList.title" label="Name" @keyup.enter="onListSave" @keyup.esc="$emit('onCancel')"
                    @blur="onTitleBlur" autofocus>
                </q-input>
            </header>
            <ul></ul>
            <footer>
                <q-btn size="sm" class="q-ml-xs q-mr-sm" color="primary" @click="onListSave"
                    :disable="boardList.title.length === 0">Save</q-btn>
                <q-btn size="sm" outline @click="$emit('onCancel')" class="draftBoardCancelButton">Cancel</q-btn>
            </footer>
        </div>
    </div>
</template>

<script lang="ts" setup>

import { ref, defineProps, defineEmits } from "vue";

import { DraftBoardList } from '@/api/types';
import { BoardListAPI } from "@/api/boardList";


interface Props {
    boardId: number;
}

const props = defineProps<Props>();
const emit = defineEmits(["onSaveSuccess", "onCancel"]);

const boardList = ref<DraftBoardList>({ board_id: props.boardId, title: "" });


const onTitleBlur = (ev: any) => {
    let relatedTargetClasses = [];
    if (ev.relatedTarget)
        relatedTargetClasses = ev.relatedTarget.getAttribute("class").split(" ");
    if (!relatedTargetClasses.includes("draftBoardCancelButton") && boardList.value.title.length > 0) {
        onListSave();
    }
    else {
        emit("onCancel");
    }
};

const onListSave = async () => {
    // store.dispatch.board.newBoardList(boardList.value);
    await BoardListAPI.postBoardList(props.boardId, boardList.value);
    emit("onSaveSuccess");
};

</script>