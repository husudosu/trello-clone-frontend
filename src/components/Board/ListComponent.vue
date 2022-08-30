<template>
    <div class="list">
        <header @dblclick="editListTitle = !editListTitle">
            <template v-if="editListTitle">
                <q-input v-model="boardList.title" label="Name" @keyup.enter="onListSave" @blur="onListSave" autofocus>
                </q-input>
            </template>
            <template v-else>
                {{  boardList.title  }}
                <q-btn flat round icon="more_horiz">
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
                :delayOnTouchOnly="true" :touchStartThreshold="100" :delay="100" v-if="boardList.id">
                <template #item="{ element }">
                    <li class="listCard" @click="onCardClick(element)">
                        <template v-if="element.id">
                            {{  element.title  }}
                        </template>
                        <template v-else>
                            <q-input v-model="element.title" type="textarea" label="Card title"
                                @keyup.enter="onCardTitleKeyUp($event, element)" @blur="saveCard(element)" autofocus
                                autogrow>
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
import { BoardList, Card, BoardPermission } from '@/api/types';
import { defineProps, ref, nextTick } from 'vue';
import draggable from 'vuedraggable';

import store from "@/store";
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

const saveCard = (card: Card) => {
    if (boardList.value.id) {
        if (card.title && card.title.length > 0) {
            // Save card into db
            store.dispatch.board.saveCard({ boardListId: boardList.value.id, card });
        }
        else {
            // Remove draft card
            store.commit.board.removeCard({ boardListId: boardList.value.id, card });
        }
    }
};

const onCardTitleKeyUp = (ev: KeyboardEvent, card: Card) => {
    if (ev.ctrlKey) saveCard(card);
};

const onCardClick = (item: Card) => {
    if (item.id) {
        store.dispatch.card.loadCard(item.id).then(() => {
            store.commit.card.setVisible(true);
            store.dispatch.card.loadCardActivities();
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
</script>