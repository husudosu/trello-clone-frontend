<template>
    <div class="listWrapper" ref="listWrapperRef">
        <div class="list">
            <header @dblclick="onTitleDblClick" class="listHeader">
                <template v-if="editListTitle">
                    <q-input v-model="newListTitle" label="Name" @keyup.enter="onListSave" @blur="onListSave" autofocus>
                    </q-input>
                </template>
                <template v-else>
                    {{ props.boardList.title }}
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
                <draggable :data-id="props.boardList.id" class="list-group" v-model="cards" group="board-cards"
                    itemKey="id" @end="onEnd" draggable=".listCard" :delayOnTouchOnly="true" :touchStartThreshold="100"
                    :delay="100" v-if="props.boardList.id" :scroll-sensitivity="200" :fallback-tolerance="1"
                    :force-fallback="true" :animation="200">
                    <template #item="{ element }">
                        <list-card :card="element" :boardListId="props.boardList.id"></list-card>
                    </template>
                </draggable>
                <template v-if="showAddCard">
                    <draft-card :boardListId="props.boardList.id" :onCancel="() => { showAddCard = false; }"
                        :onSaveSuccess="() => { showAddCard = false; }"></draft-card>
                </template>
            </ul>
            <footer @click="onAddCardClick">
                <div v-if="props.boardList.id" class="boardListAddCard">
                    <q-icon class="q-mr-xs" name="add"></q-icon>Add a card...
                </div>
                <div v-else>
                    <q-btn size="sm" class="q-ml-xs q-mr-sm" color="primary" @click="onListSave">Save</q-btn>
                    <q-btn size="sm" outline @click="onCancelClicked">Cancel</q-btn>
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

type OnEnd = (ev: any) => void;

interface Props {
    boardList: BoardList;
    onEnd: OnEnd;
}
const listWrapperRef = ref();
const props = defineProps<Props>();
const hasPermission = store.getters.board.hasPermission;
const cardsWrapper = ref();

const editListTitle = ref(false);
const newListTitle = ref("");

const showMenu = ref(false);
const $q = useQuasar();

const cards = computed({
    get() {
        return props.boardList.cards;
    },
    set(value) {
        store.commit.board.setCards({ cards: value, listId: props.boardList.id });
    }
});
const showAddCard = ref(false);

const onListSave = () => {
    if (props.boardList.id && newListTitle.value.length > 0) {
        store.dispatch.board.updateBoardList({ ...props.boardList, title: newListTitle.value })
            .finally(() => {
                editListTitle.value = false;
            });
        listWrapperRef.value.classList.remove("draftBoardList");
    }
    else {
        store.commit.board.removeList(props.boardList);
    }
};


const onCancelClicked = () => {
    if (props.boardList.id) {
        editListTitle.value = false;
    }
    else {
        // Delete draft card
        store.commit.board.removeList(props.boardList);
    }
};

const onAddCardClick = () => {
    if (hasPermission(BoardPermission.CARD_EDIT) && props.boardList.id) {
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
        message: `Delete list ${props.boardList.title}?`,
        ok: {
            label: "Delete",
            color: "negative"
        }
    }).onOk(() => {
        store.dispatch.board.removeBoardList(props.boardList);
    });
};

if (!props.boardList.title) {
    editListTitle.value = true;
}

const onTitleDblClick = () => {
    if (props.boardList.id) {
        editListTitle.value = !editListTitle.value;
        // Make clone of title
        newListTitle.value = props.boardList.title.slice();
    }
};
// If the board draft don't allow drag.
onMounted(() => {
    if (!props.boardList.id) {
        listWrapperRef.value.classList.add("draftBoardList");
    }
});
</script>