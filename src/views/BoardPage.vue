<template>
    <div class="ui" ref="boardWrapper">
        <!-- Car details -->
        <card-details-dialog></card-details-dialog>
        <!-- Add member dialog -->
        <nav class="navbar board" v-if="!$q.screen.xs">
            {{ board?.title }}
            <div class="boardButtons">
                <q-btn class="q-ml-lg btn" flat @click="onDeleteBoardClicked"
                    v-if="hasPermission(BoardPermission.BOARD_DELETE)">Delete board
                </q-btn>
                <q-btn class="q-ml-md btn" flat @click="onMembersClicked">Members</q-btn>
                <q-btn class="q-ml-md btn" flat @click="onAddMemberClicked" v-if="isAdmin">Add
                    member
                </q-btn>
            </div>
        </nav>
        <!-- Dragabble object for reordering lists-->
        <div class="lists" ref="listsWrapper" v-if="board">
            <draggable v-model="boardLists" itemKey="data-id" :delayOnTouchOnly="true" :touchStartThreshold="100"
                :delay="500" @end="onBoardListSortableMoveEnd" group="board-list" handle=".listHeader"
                style="display:flex" direction="horizontal" :scroll-sensitivity="170" :fallback-tolerance="1"
                :force-fallback="true" :animation="200">
                <!-- Board list object and reorder handling of cards.-->
                <template #item="{ element }">
                    <board-list-vue :onEnd="onCardSortableMoveEnd" :boardList="element">
                    </board-list-vue>
                </template>
            </draggable>

            <!-- Add new list -->
            <div v-if="hasPermission(BoardPermission.LIST_CREATE)">
                <template v-if="!showAddDraftList">
                    <div class="listWrapper">
                        <div class="addNewList">
                            <header class="listHeader" @click="onNewListClicked">
                                <q-icon class="q-mr-xs" name="add"></q-icon>Add a list...
                            </header>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <draft-board-list :boardId="board.id" :onCancel="() => { showAddDraftList = false; }"
                        :onSaveSuccess="() => { showAddDraftList = false; }"></draft-board-list>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter, onBeforeRouteLeave } from "vue-router";
import { useQuasar } from 'quasar';
import draggable from 'vuedraggable';

import store from "@/store/index";
import { CardAPI } from "@/api/card";
import { BoardListAPI } from '@/api/boardList';
import { BoardAPI } from "@/api/board";
import { BoardPermission } from "@/api/types";

import CardDetailsDialog from "@/components/CardDetailsDialog.vue";
import BoardListVue from "@/components/Board/List/BoardList.vue";
import AddMemberDialog from "@/components/Board/AddMemberDialog.vue";
import MembersDialog from "@/components/Board/MembersDialog.vue";
import DraftBoardList from "@/components/Board/List/DraftBoardList.vue";
import { useSocketIO, SIOEvent, SIOBoardEventListeners } from "@/socket";

const $q = useQuasar();
const { socket } = useSocketIO();

/*
Socket.IO handler for boards.
*/
socket.on(SIOEvent.SIOError, SIOBoardEventListeners.onError);
socket.on(SIOEvent.SIOConnect, SIOBoardEventListeners.onConnect);
socket.onAny((event, ...args) => {
    console.debug(`[Socket.IO]: Got event: ${event}`);
});

socket.on(SIOEvent.CARD_NEW, SIOBoardEventListeners.newCard);
socket.on(SIOEvent.CARD_UPDATE, SIOBoardEventListeners.cardUpdate);
socket.on(SIOEvent.CARD_UPDATE_ORDER, SIOBoardEventListeners.cardOrderUpdate);
socket.on(SIOEvent.CARD_DELETE, SIOBoardEventListeners.cardDelete);
socket.on(SIOEvent.LIST_NEW, SIOBoardEventListeners.newList);
socket.on(SIOEvent.LIST_UPDATE_ORDER, SIOBoardEventListeners.listUpdateOrder);
socket.on(SIOEvent.LIST_UPDATE, SIOBoardEventListeners.listUpdate);
socket.on(SIOEvent.LIST_DELETE, SIOBoardEventListeners.deleteList);

const board = computed(() => store.state.board.board);

const boardLists = computed({
    get() {
        return store.state.board.board ? store.state.board.board.lists : [];
    },
    set(value) {
        store.commit.board.setLists(value);
    }
});

const hasPermission = store.getters.board.hasPermission;
const isAdmin = computed(() => store.getters.board.isAdmin);

const route = useRoute();
const router = useRouter();
const listsWrapper = ref();

const showAddDraftList = ref(false);

/*
    Dragabble object events for board lists
*/
const onBoardListSortableMoveEnd = () => {
    if (board.value != null) {
        BoardAPI.updateBoardListsOrder(board.value);
    }
};

//Draggable object events for cards
const onCardSortableMoveEnd = async (ev: any) => {
    const cardId: number = parseInt(ev.item.getAttribute("data-id"));
    const listFromId: number = parseInt(ev.from.getAttribute("data-id"));
    const listToId: number = parseInt(ev.to.getAttribute("data-id"));

    /* FIXME: Hacky way to prevent card click event after move.
    The issue only appears when you move card inside a list
    If you move one list to other it's not an isssue
    */
    store.commit.card.setCardMoved(true);
    setTimeout(() => store.commit.card.setCardMoved(false), 30);

    if (listFromId !== listToId) {
        // Change list id of card.
        const updatedCard = await CardAPI.patchCard(cardId, { list_id: listToId });
        /* 
        Provide listToId as from_list_id because when this store commit runs.
        The computed variables already by vue-draggable boardLists and cards on BoardPage, BoardList
        */
        store.commit.board.SIOUpdateCard({ card: updatedCard, from_list_id: listToId });
        // BoardList changed so need to update both fromList and toList
        const listFrom = board.value?.lists.find((el) => el.id == listFromId);
        if (listFrom !== undefined) {
            await BoardListAPI.updateCardsOrder(listFrom);
        }
    }

    if (ev.oldIndex !== ev.newIndex || listFromId !== listToId) {
        const listTo = board.value?.lists.find((el) => el.id == listToId);
        if (listTo !== undefined) {
            await BoardListAPI.updateCardsOrder(listTo);
        }
    }

};

const loadBoard = async (boardId: number) => {
    $q.loading.show({ delay: 400 });
    await store.dispatch.board.loadBoard({ boardId })
        .catch((err) => {
            switch (err.response.status) {
                case 404:
                    router.replace({ name: "404" });
                    break;
                case 403:
                    router.replace({ name: "403" });
                    break;
            }
        });
    $q.loading.hide();
};

const onDeleteBoardClicked = () => {
    $q.dialog({
        title: "Delete board",
        cancel: true,
        persistent: true,
        message: `Delete board ${board.value ? board.value.title : ''}?`,
        ok: {
            label: "Delete",
            color: "negative"
        }
    }).onOk(() => {
        if (typeof route.params.boardId === "string")
            store.dispatch.board.removeBoard(parseInt(route.params.boardId))
                .then(() => { router.push({ name: "boards" }); });
    });
};

const onNewListClicked = () => {
    // This will scroll the end of div.
    showAddDraftList.value = true;
    nextTick(() => {
        listsWrapper.value.scroll(listsWrapper.value.scrollWidth, 0);
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

onBeforeRouteUpdate(async (to, from) => {
    store.commit.board.unLoadBoard();
    if (to.params.boardId !== from.params.boardId && typeof to.params.boardId === "string") {
        await loadBoard(parseInt(to.params.boardId));
        socket.emit("board_change", { board_id: to.params.boardId });
    }
});

onMounted(() => {
    if (typeof route.params.boardId === "string") {
        loadBoard(parseInt(route.params.boardId));
        socket.emit("board_change", { board_id: route.params.boardId });
    }
})

</script>
<style lang="scss">
@import "../styles/board.scss";
</style>
