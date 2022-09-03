<template>
    <div class="listWrapper" ref="listWrapperRef">
        <div class="list">
            <!-- TODO: Handle permission here aswell, do not inject dblclick here, it's gonna be more complex-->
            <header @dblclick="boardList.id ? editListTitle = !editListTitle : editListTitle = true" class="listHeader">
                <template v-if="editListTitle">
                    <q-input v-model="boardList.title" label="Name" @keyup.enter="onListSave" @blur="onListSave"
                        autofocus>
                    </q-input>
                </template>
                <template v-else>
                    {{ boardList.title }}
                    <q-btn flat round icon="more_horiz" style="float: right;">
                        <q-menu v-model="showMenu">
                            <q-list style="min-width: 100px">
                                <q-item clickable @click="onDeleteBoardList"
                                    :disable="!hasPermission(BoardPermission.LIST_DELETE)">
                                    <q-item-section>Deltete list</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </template>
            </header>
            <ul ref="cardsWrapper">
                <draggable :id="'boardlistCards-' + boardList?.id" class="list-group" :list="boardList.cards"
                    group="board-cards" itemKey="id" @end="onEnd" :move="onMove" draggable=".listCard"
                    :delayOnTouchOnly="true" :touchStartThreshold="100" :delay="100" v-if="boardList.id"
                    filter=".draftCard">
                    <template #item="{ element }">
                        <list-card :card="element" :boardListId="boardList?.id"></list-card>
                    </template>
                </draggable>
            </ul>
            <footer @click="onAddCardClick">
                <div v-if="boardList.id" class="boardListAddCard">
                    <q-icon class="q-mr-xs" name="add"></q-icon>Add a card...
                </div>
                <div v-else>
                    <q-btn size="sm" class="q-ml-xs q-mr-sm" color="primary" @click="onListSave">Save</q-btn>
                    <q-btn size="sm" outline @click="onListSave">Cancel</q-btn>
                </div>
            </footer>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { BoardList, BoardPermission } from '@/api/types';
import { defineProps, ref, nextTick, onMounted } from 'vue';
import draggable from 'vuedraggable';

import store from "@/store";

import ListCard from "@/components/Board/ListCard.vue";

/* TODO: Implement events of VueDraggable, Vue3 version off draggable is not contains event types
Vue v2 sortable.js:
https://github.com/SortableJS/Vue.Draggable/blob/master/src/vuedraggable.d.ts
Vue v3 sortable.js:
https://github.com/SortableJS/vue.draggable.next/blob/master/types/vuedraggable.d.ts
*/

type OnMove = (ev: any) => void;
type OnEnd = (ev: any) => void;

interface Props {
    boardList: BoardList;
    onMove: OnMove;
    onEnd: OnEnd;
}
const listWrapperRef = ref();
const props = defineProps<Props>();
const hasPermission = store.getters.board.hasPermission;
const cardsWrapper = ref();

const editListTitle = ref(false);
const showMenu = ref(false);

const boardList = ref(props.boardList);

const onListSave = () => {
    if (boardList.value.title && boardList.value.title.length > 0) {
        store.dispatch.board.saveBoardList(boardList.value)
            .finally(() => {
                editListTitle.value = false;
            });
        listWrapperRef.value.classList.remove("draftBoardList");
    }
    else {
        store.commit.board.removeList(boardList.value);
    }
};

const onAddCardClick = () => {
    /* FIXME: Blank card not appears if switching board page from other site.
    The blank card is created on boardlist, but the text input not appearing.
    F5 or hot-reload on board page is solves the problem.

    Update:
        - Now navigating works, the solution was to implement an unload method which runs everytime when route changes
        - Now the issue appears only when hot-reloading if you change BoardPage.
    */

    if (hasPermission(BoardPermission.CARD_EDIT) && boardList.value.id) {
        console.log("Add new blank card");
        store.commit.board.addCard(boardList.value.id);
        nextTick(() => {
            cardsWrapper.value.scroll(0, cardsWrapper.value.scrollHeight);
        });
    }
};

const onDeleteBoardList = () => {
    if (confirm("Are you sure about deleting list?")) {
        store.dispatch.board.removeBoardList(boardList.value);
    }
};

if (!boardList.value.title) {
    editListTitle.value = true;
}

// If the board draft don't allow drag.
onMounted(() => {
    if (!boardList.value.id) {
        listWrapperRef.value.classList.add("draftBoardList");
    }
});
</script>