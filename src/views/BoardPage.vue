<template>
    <div class="ui" ref="boardWrapper">
        <card-details-dialog></card-details-dialog>
        <nav class="navbar board">
            {{ board?.title }}
            <q-btn style="margin-left: 10px" color="secondary" @click="onDeleteBoardClicked">Delete board</q-btn>
            <q-btn style="margin-left: 10px" color="secondary" @click="onNewListClicked">New list</q-btn>
        </nav>
        <!-- Dragabble object for reordering lists-->
        <draggable class="lists" ref="listsWrapper" :list="board?.lists" itemKey="id" :delayOnTouchOnly="true"
            :touchStartThreshold="100" :delay="500" @end="onBoardListSortableMoveEnd">
            <!-- Board list object and reorder handling of cards.-->
            <template #item="{ element }">
                <board-list-component :onMove="onCardMove" :onEnd="onCardSortableMoveEnd" :boardList="element">
                </board-list-component>
            </template>
        </draggable>
    </div>
</template>

<script lang="ts" setup>

import { computed, nextTick, ref } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";

import draggable from 'vuedraggable';

import store from "@/store/index";
import { patchCard } from "@/api/card";
import { updateCardsOrder } from '@/api/boardList';
import { updateBoardListsOrder } from "@/api/board";

import CardDetailsDialog from "@/components/CardDetailsDialog.vue";
import BoardListComponent from '../components/BoardListComponent.vue';


// Card details modal stuff.
const board = computed(() => store.state.board.board);
const route = useRoute();
const router = useRouter();
const listsWrapper = ref();


let cardId: number | undefined;
let cardMoving = false;

/*
    Dragabble object events for board lists
*/
const onBoardListSortableMoveEnd = async () => {
    if (board.value != null) {
        updateBoardListsOrder(board.value);
    }
};

/*
    Draggable object events for cards
    FIXME: Structrue wise not so ideal to store these methods here.
*/
const onCardSortableMoveEnd = async (ev: any) => {
    if (cardMoving) {
        const boardFromId: number = parseInt(ev.from.id.split("boardlistCards-")[1]);
        const boardToId: number = parseInt(ev.to.id.split("boardlistCards-")[1]);

        if (boardFromId !== boardToId && cardId !== undefined) {
            // Change list id of card.
            await patchCard(cardId, { list_id: boardToId });
            // BoardList changed so need to update both fromList and toList
            const listFrom = board.value?.lists.find((el) => el.id == boardFromId);
            if (listFrom !== undefined) {
                await updateCardsOrder(listFrom);
            }
        }

        const listTo = board.value?.lists.find((el) => el.id == boardToId);
        if (listTo !== undefined) {
            await updateCardsOrder(listTo);
        }
        cardMoving = false;
    }
};

const onCardMove = async (ev: any) => {
    cardMoving = true;
    cardId = ev.draggedContext.element.id;
};

const loadBoard = (boardId: number) => {
    store.dispatch.board.loadBoard({ boardId })
        .catch((err: any) => {
            if (err.response.status === 404) {
                router.push({ name: '404' });
            }
        });

};

const onDeleteBoardClicked = () => {
    if (confirm("Are you sure about deleting board?") && typeof route.params.boardId === "string") {
        store.dispatch.board.removeBoard(parseInt(route.params.boardId))
            .then(() => { router.push({ name: "boards" }); });
    }
};

const onNewListClicked = () => {
    store.commit.board.addNewList();
    // This will scroll the end of div.
    nextTick(() => {
        listsWrapper.value.targetDomElement.scroll(listsWrapper.value.targetDomElement.scrollWidth, 0);
    });
};

onBeforeRouteUpdate((to, from) => {
    if (to.params.boardId !== from.params.boardId && typeof to.params.boardId === "string") {
        loadBoard(parseInt(to.params.boardId));
    }
});

if (typeof route.params.boardId === "string") {
    loadBoard(parseInt(route.params.boardId));
}


</script>
<style lang="scss">
@import "../styles/board.scss";
</style>