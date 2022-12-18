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
                                    <q-item-section>Archive</q-item-section>
                                </q-item>
                            </q-list>
                        </q-menu>
                    </q-btn>
                </template>
            </header>
            <ul ref="cardsWrapper">
                <draggable :data-id="props.boardList.id" class="list-group" v-model="cards" group="board-cards"
                    itemKey="id" @end="$emit('onCardMoveEnd', $event)" draggable=".listCard" :delayOnTouchOnly="true"
                    :touchStartThreshold="100" :delay="100" v-if="props.boardList.id" :scroll-sensitivity="200"
                    :fallback-tolerance="1" :force-fallback="true" :animation="200" filter=".draftCard">
                    <template #item="{ element }">
                        <list-card :card="element"></list-card>
                    </template>
                </draggable>
                <template v-if="showAddCard">
                    <draft-card-vue @save="onSaveCard" @cancel="showAddCard = false"></draft-card-vue>
                </template>
            </ul>
            <footer @click="onAddCardClick">
                <div v-if="props.boardList.id" class="boardListAddCard non-selectable">
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
import { BoardList, BoardPermission, DraftCard } from '@/api/types';
import { defineProps, ref, nextTick, onMounted, computed, defineEmits } from 'vue';
import { useQuasar } from 'quasar';
import draggable from 'vuedraggable';

import store from "@/store";

import ListCard from "@/components/Board/Card/ListCard.vue";
import DraftCardVue from "@/components/Board/Card/DraftCard.vue";
import { BoardListAPI } from '@/api/boardList';
import { CardAPI } from '@/api/card';

/* TODO: Implement events of VueDraggable, Vue3 version off draggable is not contains event types
Vue v2 sortable.js:
https://github.com/SortableJS/Vue.Draggable/blob/master/src/vuedraggable.d.ts
Vue v3 sortable.js:
https://github.com/SortableJS/vue.draggable.next/blob/master/types/vuedraggable.d.ts
*/

defineEmits(['onCardMoveEnd']);

const listWrapperRef = ref();
const props = defineProps<{ boardList: BoardList; }>();
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

const onListSave = async () => {
    if (props.boardList.id && newListTitle.value.length > 0) {
        try {
            $q.loading.show({ delay: 150 });
            await BoardListAPI.patchBoardList(props.boardList.id, { title: newListTitle.value });
            editListTitle.value = false;
            listWrapperRef.value.classList.remove("draftBoardList");
        }
        finally {
            $q.loading.hide();
        }
    }
};


const onCancelClicked = () => {
    if (props.boardList.id)
        editListTitle.value = false;
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
        title: "Archive list",
        cancel: true,
        persistent: true,
        message: `Archive list ${props.boardList.title}?`,
        ok: {
            label: "Archive",
            color: "negative"
        }
    }).onOk(() => {
        BoardListAPI.deleteBoardList(props.boardList.id);
        showMenu.value = false;
    }).onCancel(() => {
        showMenu.value = false;
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
        editListTitle.value ? listWrapperRef.value.classList.add("draftBoardList") : listWrapperRef.value.classList.remove("draftBoardList");
    }
};

const onSaveCard = async (card: DraftCard) => {
    showAddCard.value = false;
    await CardAPI.postCard(props.boardList.id, card);
};

// If the board draft don't allow drag.
onMounted(() => {
    if (!props.boardList.id) {
        listWrapperRef.value.classList.add("draftBoardList");
    }
});
</script>