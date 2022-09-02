<template>
    <div class="ui" ref="boardWrapper">
        <!-- Car details -->
        <card-details-dialog></card-details-dialog>
        <!-- Add member dialog -->
        <nav class="navbar board">
            {{ board?.title }}
            <q-btn class="q-ml-lg" color="secondary" @click="onDeleteBoardClicked"
                v-if="hasPermission(BoardPermission.BOARD_DELETE)">Delete board</q-btn>
            <q-btn class="q-ml-md" color="secondary" @click="onNewListClicked"
                v-if="hasPermission(BoardPermission.LIST_CREATE)">New list</q-btn>
            <q-btn class="q-ml-md" color="secondary" @click="onMembersClicked">Members</q-btn>
            <q-btn class="q-ml-md" color="secondary" @click="onAddMemberClicked" v-if="isAdmin">Add member
            </q-btn>
        </nav>
        <!-- Dragabble object for reordering lists-->

        <draggable class="lists" ref="listsWrapper" :list="board?.lists" itemKey="id" :delayOnTouchOnly="true"
            :touchStartThreshold="100" :delay="500" @end="onBoardListSortableMoveEnd" group="board-list"
            draggable=".list">
            <!-- Board list object and reorder handling of cards.-->
            <template #item="{ element }">
                <list-component class="list" :onMove="onCardMove" :onEnd="onCardSortableMoveEnd" :boardList="element"
                    :data-draggable="true">
                </list-component>
            </template>
        </draggable>
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, ref } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useQuasar } from 'quasar';
import draggable from 'vuedraggable';

import store from "@/store/index";
import { CardAPI } from "@/api/card";
import { BoardListAPI } from '@/api/boardList';
import { BoardAPI } from "@/api/board";
import { BoardPermission } from "@/api/types";

import CardDetailsDialog from "@/components/CardDetailsDialog.vue";
import ListComponent from '@/components/Board/ListComponent.vue';
import AddMemberDialog from "@/components/Board/AddMemberDialog.vue";
import MembersDialog from "@/components/Board/MembersDialog.vue";

const $q = useQuasar();

// Card details modal stuff.
const board = computed(() => store.state.board.board);
const hasPermission = store.getters.board.hasPermission;
const isAdmin = computed(() => store.getters.board.isAdmin);

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
        BoardAPI.updateBoardListsOrder(board.value);
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
            await CardAPI.patchCard(cardId, { list_id: boardToId });
            // BoardList changed so need to update both fromList and toList
            const listFrom = board.value?.lists.find((el) => el.id == boardFromId);
            if (listFrom !== undefined) {
                await BoardListAPI.updateCardsOrder(listFrom);
            }
        }

        const listTo = board.value?.lists.find((el) => el.id == boardToId);
        if (listTo !== undefined) {
            await BoardListAPI.updateCardsOrder(listTo);
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
        .catch((err) => {
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

const onAddMemberClicked = () => {
    $q.dialog({
        component: AddMemberDialog,
    });
};

const onMembersClicked = () => {
    $q.dialog({
        component: MembersDialog,
    });

};
onBeforeRouteLeave(() => {
    store.commit.board.unLoadBoard();
});

onBeforeRouteUpdate((to, from) => {
    store.commit.board.unLoadBoard();
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