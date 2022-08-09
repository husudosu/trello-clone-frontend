<template>
    <div class="ui">
        <card-details-dialog></card-details-dialog>
        <nav class="navbar board">
            {{ board?.title }}
            <q-btn style="margin-left: 10px" color="secondary" @click="onDeleteBoardClicked">Delete board</q-btn>
            <q-btn style="margin-left: 10px" color="secondary" @click="onNewListClicked">New list</q-btn>
        </nav>
        <div class="lists">
            <board-list v-for="list in board?.lists" :key="list.id" :onMove="onMove" :onChange="onChange"
                :onEnd="onSortableMoveEnd" :boardList="list">
            </board-list>
        </div>
    </div>
</template>

<script lang="ts" setup>

import store from "@/store/index";
import { computed } from "vue";
import BoardList from "@/components/BoardList.vue";

import { patchCard } from "@/api/card";
import { updateCardsOrder } from '@/api/boardList';
import CardDetailsDialog from "@/components/CardDetailsDialog.vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";

// Card details modal stuff.
const board = computed(() => store.state.board.board);
const route = useRoute();
const router = useRouter();


let cardId: number | undefined;
let moving = false;


const onSortableMoveEnd = async (ev: any) => {
    if (moving) {
        const boardFromId: number = parseInt(ev.from.id.split("-")[1]);
        const boardToId: number = parseInt(ev.to.id.split("-")[1]);

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
        moving = false;
    }
};

const onMove = async (ev: any) => {
    moving = true;
    cardId = ev.draggedContext.element.id;
    // Checks if on same list 
};

const onChange = async (ev: any) => {
    console.log(ev);
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
    store.commit.board.addNewList();
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