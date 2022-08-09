<template>
    <div class="list">
        <header @dblclick="editListTitle = !editListTitle">
            <template v-if="editListTitle">
                <q-input v-model="boardList.title" label="Name" @keyup.enter="onListUpdate"></q-input>
            </template>
            <template v-else>
                {{ boardList.title }}
            </template>
        </header>
        <ul>
            <draggable :id="'boardlist-' + boardList?.id" class="list-group" :list="boardList.cards" group="board-list"
                @change="onChange" itemKey="id" @end="onEnd" :move="onMove" draggable=".item" style="height: 100%"
                :delayOnTouchOnly="true" :touchStartThreshold="100" :delay="100" v-if="boardList.id">
                <template #item="{ element }">
                    <li class="item" @click="onCardClick(element)">
                        <template v-if="element.id">
                            {{ element.title }}
                        </template>
                        <template v-else>
                            <q-input v-model="element.title" label="Card title" @keyup.enter="onSaveCard(element)">
                            </q-input>
                        </template>
                    </li>
                </template>
            </draggable>
        </ul>
        <footer @click="onAddCardClick">Add a card...</footer>
    </div>
</template>

<script lang="ts" setup>
import { BoardList, Card } from '@/api/types';
import { defineProps, ref } from 'vue';
import draggable from 'vuedraggable';
import store from "@/store";
type OnMove = (ev: any) => void;
type OnEnd = (ev: any) => void;
type OnChange = (ev: any) => void;

interface Props {
    boardList: BoardList;
    onMove: OnMove;
    onEnd: OnEnd;
    onChange: OnChange;
}

const props = defineProps<Props>();

const editListTitle = ref(false);
const newCardTitle = ref<string>();

const boardList = ref(props.boardList);

const onListUpdate = () => {
    store.dispatch.board.saveBoardList(boardList.value)
        .finally(() => editListTitle.value = false);
};

const onAddCardClick = () => {
    if (boardList.value.id) {
        store.commit.board.addCard(boardList.value.id);
    }
};

const onSaveCard = (card: Card) => {
    if (boardList.value.id) {
        store.dispatch.board.saveCard({ boardListId: boardList.value.id, card });
    }
};

const onCardClick = (item: Card) => {
    if (item.id) {
        store.dispatch.card.loadCard({ cardId: item.id }).then(() => {
            store.commit.card.setVisible(true);
        }).catch((err) => {
            console.log("Cannot load card:");
            console.log(err);
        });
    }
};


if (!boardList.value.title) {
    editListTitle.value = true;
}
</script>