<template>
    <div class="ui">
        <card-details-dialog></card-details-dialog>
        <nav class="navbar board">
            {{ board?.title }}
            <q-btn style="margin-left: 10px" color="secondary" @click="onDeleteBoardClicked">Delete board</q-btn>
            <q-btn style="margin-left: 10px" color="secondary" @click="onNewListClicked">New list</q-btn>
        </nav>
        <!-- Dragabble object for reordering lists-->
        <draggable class="lists" :list="board?.lists" itemKey="id" :delayOnTouchOnly="true" :touchStartThreshold="100"
            :delay="500">
            <!-- Board list object and reorder handling of cards.-->
            <template #item="{ element }">
                <board-list :onMove="onCardMove" :onEnd="onCardSortableMoveEnd" :boardList="element">
                </board-list>
            </template>
        </draggable>
    </div>
</template>

<script lang="ts" setup>

import store from "@/store/index";
import { computed, nextTick } from "vue";
import BoardList from "@/components/BoardList.vue";

import { patchCard } from "@/api/card";
import { updateCardsOrder } from '@/api/boardList';
import CardDetailsDialog from "@/components/CardDetailsDialog.vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import draggable from 'vuedraggable';

// Card details modal stuff.
const board = computed(() => store.state.board.board);
const route = useRoute();
const router = useRouter();


let cardId: number | undefined;
let cardMoving = false;

let boardlistId: number | undefined;
let boardlistMoving = false;

/*
    Dragabble object events for board lists
*/
const onBoardListSortableMoveEnd = async (ev: any) => {
    console.log("Ok");
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
    // Checks if on same list 
};

const loadBoard = (boardId: number) => {
    store.dispatch.board.loadBoard({ boardId }).catch((err: any) => {
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
    console.log(document.body.scrollWidth);
    store.commit.board.addNewList();
    // Scroll to right side of screen
    nextTick(() => {
        console.log(document.body.scrollWidth);
        window.scrollTo(document.body.scrollWidth, 0);
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