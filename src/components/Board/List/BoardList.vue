<template>
    <div class="listWrapper" ref="listWrapperRef">
        <div class="list">
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
                <draggable :id="'boardlistCards-' + boardList?.id" class="list-group" v-model="cards"
                    group="board-cards" itemKey="id" @end="onEnd" :move="onMove" draggable=".listCard"
                    :delayOnTouchOnly="true" :touchStartThreshold="100" :delay="100" v-if="boardList.id"
                    :scroll-sensitivity="200" :fallback-tolerance="1" :force-fallback="true" :animation="200">
                    <template #item="{ element }">
                        <list-card :card="element" :boardListId="boardList?.id"></list-card>
                    </template>
                </draggable>
                <template v-if="showAddCard">
                    <draft-card :boardListId="boardList.id" :onCancel="() =>{showAddCard = false}"
                        :onSaveSuccess="() => {showAddCard = false}"></draft-card>
                </template>
            </ul>
            <footer @click="onAddCardClick">
                <div v-if="boardList.id" class="boardListAddCard">
                    <q-icon class="q-mr-xs" name="add"></q-icon>Add a card...
                </div>
                <div v-else>
                    <q-btn size="sm" class="q-ml-xs q-mr-sm" color="primary" @click="onListSave">Save</q-btn>
                    <q-btn size="sm" outline @click="onCacnelClicked">Cancel</q-btn>
                </div>
            </footer>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { BoardList, BoardPermission } from '@/api/types';
import { defineProps, ref, nextTick, onMounted, computed } from 'vue';
import { useQuasar } from 'quasar';
import draggable from 'vuedraggable';

import store from "@/store";

import ListCard from "@/components/Board/Card/ListCard.vue";
import DraftCard from "@/components/Board/Card/DraftCard.vue";

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
const $q = useQuasar();

const boardList = ref(props.boardList);
const cards = computed({
    get() {
        // FIXME: This is a hacky way, come up with better solution to handle vuex.
        if (store.state.board.board) {
            const index = store.state.board.board.lists.findIndex((el) => el.id == boardList.value.id);
            return index > -1 ? store.state.board.board?.lists[index].cards : [];
        }
        else return [];
    },
    set(value) {
        store.commit.board.setCards({ cards: value, listId: boardList.value.id });
    }
});
const showAddCard = ref(false);

const onListSave = () => {
    if (boardList.value.title && boardList.value.title.length > 0) {
        store.dispatch.board.updateBoardList(boardList.value)
            .finally(() => {
                editListTitle.value = false;
            });
        listWrapperRef.value.classList.remove("draftBoardList");
    }
    else {
        store.commit.board.removeList(boardList.value);
    }
};


const onCacnelClicked = () => {
    if (boardList.value.id) {
        editListTitle.value = false;
    }
    else {
        // Delete draft card
        store.commit.board.removeList(boardList.value);
    }
};

const onAddCardClick = () => {
    if (hasPermission(BoardPermission.CARD_EDIT) && boardList.value.id) {
        showAddCard.value = true;
        nextTick(() => {
            cardsWrapper.value.scroll(0, cardsWrapper.value.scrollHeight);
        });
    }
};

const onDeleteBoardList = () => {
    $q.dialog({
        title: "Delete list",
        cancel: true,
        persistent: true,
        message: `Delete list ${boardList.value.title}?`,
        ok: {
            label: "Delete",
            color: "negative"
        }
    }).onOk(() => {
        store.dispatch.board.removeBoardList(boardList.value);
    });
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