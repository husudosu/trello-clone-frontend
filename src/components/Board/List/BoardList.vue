<template>
    <div class="listWrapper" ref="listWrapperRef"
        :style="{ color: props.boardList.list_textcolor, background: props.boardList.list_bgcolor }">
        <div class="list">
            <header class="listHeader" @dblclick="onTitleDblClick"
                :style="{ color: props.boardList.header_textcolor, backgroundColor: props.boardList.header_bgcolor }">
                <template v-if="editListTitle">
                    <q-input v-model="newListTitle" label="Name" @keyup.enter="onListSave" @blur="onListSave" autofocus
                        :input-style="{ color: 'white' }">
                    </q-input>
                </template>
                <template v-else>
                    <span class="non-selectable">{{ props.boardList.title }}</span>
                    <q-btn flat round icon="more_horiz" style="float: right;"
                        :aria-label="`Edit menu for ${boardList.title} list`">
                        <q-menu>
                            <q-list style="min-width: 100px">
                                <q-item clickable @click="onListEdit"
                                    :disable="!boardStore.hasPermission(BoardPermission.LIST_EDIT)" v-close-popup>
                                    <q-item-section side>
                                        <q-icon name="edit"></q-icon>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>Edit list</q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-item clickable @click="onDeleteBoardList"
                                    :disable="!boardStore.hasPermission(BoardPermission.LIST_DELETE)" v-close-popup>
                                    <q-item-section side>
                                        <q-icon name="archive"></q-icon>
                                    </q-item-section>
                                    <q-item-section>
                                        <q-item-label>Archive</q-item-label>
                                    </q-item-section>
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
                    :fallback-tolerance="1" :force-fallback="true" :animation="200" filter=".draftCard"
                    :move="onCardMove" :disabled="!boardStore.hasPermission(BoardPermission.LIST_EDIT)">
                    <template #item="{ element }">
                        <list-card :card="element" @click="onCardClick" @archive="onCardArchiveClicked"
                            @save="onCardTitleUpdate"></list-card>
                    </template>
                    <template #footer v-if="showAddCard">
                        <draft-card-vue @save="onSaveCard" @cancel="showAddCard = false"></draft-card-vue>
                    </template>
                </draggable>
            </ul>
            <footer @click="onAddCardClick"
                v-if="boardList.wip_limit === -1 || boardList.cards.length < boardList.wip_limit">
                <div class="boardListAddCard non-selectable text-center">
                    <q-icon class="q-mr-xs" name="add"></q-icon>Add card...
                </div>
            </footer>
            <footer v-else>
                <div class="boardListAddCard non-selectable text-center text-orange text-bold">
                    <q-icon class="q-mr-xs" name="warning"></q-icon>
                    WIP limit reached
                </div>
            </footer>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { IBoardList, BoardPermission, IDraftCard, ICard } from '@/api/types';
import { defineProps, ref, nextTick, computed, defineEmits } from 'vue';
import { useQuasar } from 'quasar';
import draggable from 'vuedraggable';

import ListCard from "@/components/Board/Card/ListCard.vue";
import DraftCardVue from "@/components/Board/Card/DraftCard.vue";
import { BoardListAPI } from '@/api/boardList';
import { CardAPI } from '@/api/card';
import { useBoardStore } from '@/stores/board';
import NewBoardListDialog from './NewBoardListDialog.vue';
import CardDetailsDialog from '@/components/CardDetailsDialog.vue';

/* TODO: Implement events of VueDraggable, Vue3 version off draggable is not contains event types
Vue v2 sortable.js:
https://github.com/SortableJS/Vue.Draggable/blob/master/src/vuedraggable.d.ts
Vue v3 sortable.js:
https://github.com/SortableJS/vue.draggable.next/blob/master/types/vuedraggable.d.ts
*/

const emit = defineEmits(['onCardMoveEnd', 'onCardMove']);

const boardStore = useBoardStore();
const listWrapperRef = ref();
const props = defineProps<{ boardList: IBoardList; }>();
const cardsWrapper = ref();

const editListTitle = ref(false);
const newListTitle = ref("");

const $q = useQuasar();

const cards = computed({
    get() {
        return props.boardList.cards;
    },
    set(value) {
        boardStore.setCards({ cards: value, listId: props.boardList.id });
    }
});
const showAddCard = ref(false);

const onListSave = async () => {
    try {
        $q.loading.show({ delay: 150 });
        await BoardListAPI.patchBoardList(props.boardList.id, { title: newListTitle.value });
        editListTitle.value = false;
        listWrapperRef.value.classList.remove("draftBoardList");
    }
    finally {
        $q.loading.hide();
    }
};

const onAddCardClick = () => {
    if (boardStore.hasPermission(BoardPermission.CARD_EDIT) && props.boardList.id) {
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
    });
};

const onTitleDblClick = () => {
    if (props.boardList.id && boardStore.hasPermission(BoardPermission.LIST_EDIT)) {
        editListTitle.value = !editListTitle.value;
        // Make clone of title
        newListTitle.value = props.boardList.title.slice();
        editListTitle.value ? listWrapperRef.value.classList.add("draftBoardList") : listWrapperRef.value.classList.remove("draftBoardList");
    }
};

const onCardMove = (ev: any) => {
    emit("onCardMove", ev);
};

const onSaveCard = async (card: IDraftCard) => {
    showAddCard.value = false;
    await CardAPI.postCard(props.boardList.id, card);
};

const onListEdit = async () => {
    $q.dialog({
        component: NewBoardListDialog,
        componentProps: { boardList: props.boardList }
    }).onOk((data: Partial<IBoardList>) => {
        BoardListAPI.patchBoardList(props.boardList.id, data);
    });
};

const onCardTitleUpdate = async (card: ICard) => {
    await CardAPI.patchCard(card.id, card);
};

const onCardArchiveClicked = async (card: ICard) => {
    $q.dialog({
        title: "Archive card",
        cancel: true,
        persistent: true,
        message: `Archive card ${card.title}?`,
        ok: {
            label: "Archive",
            color: "negative"
        }
    }).onOk(() => {
        CardAPI.deleteCard(card.id);
    });
};

const onCardClick = (card: ICard) => {
    $q.dialog({
        component: CardDetailsDialog,
        componentProps: { cardId: card.id }
    });
};

</script>