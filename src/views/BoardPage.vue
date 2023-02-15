<template>
    <div class="boardContainer">
        <div class="ui" ref="boardWrapper">
            <!-- Dragabble object for reordering lists-->
            <div class="lists" ref="listsWrapper" v-if="board">
                <draggable v-model="boardLists" itemKey="data-id" :delayOnTouchOnly="true" :touchStartThreshold="100"
                    :delay="500" @end="onBoardListSortableMoveEnd" group="board-list" handle=".listHeader"
                    style="display:flex" direction="horizontal" :scroll-sensitivity="170" :fallback-tolerance="1"
                    :force-fallback="true" :animation="200" filter=".draftBoardList"
                    :disabled="!boardStore.hasPermission(BoardPermission.LIST_EDIT)">
                    <!-- Board list object and reorder handling of cards.-->
                    <template #item="{ element }">
                        <board-list-vue @on-card-move-end="onCardSortableMoveEnd" :boardList="element"
                            @on-card-move="onCardMove">
                        </board-list-vue>
                    </template>
                </draggable>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { computed, onMounted, onUnmounted, ref } from "vue";
import { onBeforeRouteUpdate, useRoute, useRouter } from "vue-router";
import draggable from 'vuedraggable';

import { BoardAPI } from "@/api/board";
import { BoardListAPI } from '@/api/boardList';
import { CardAPI } from "@/api/card";
import { useBoardStore } from "@/stores/board";

import { BoardPermission } from "@/api/types";
import BoardListVue from "@/components/Board/List/BoardList.vue";
import { SIOBoardEventListeners, SIOEvent, useSocketIO } from "@/socket";
import { useCardStore } from "@/stores/card";

const $q = useQuasar();
const { socket } = useSocketIO();

const boardStore = useBoardStore();
const cardStore = useCardStore();

const board = computed(() => boardStore.board);
const boardId = ref<number>(0);
const boardLists = computed({
    get() {
        return boardStore.board ? boardStore.board.lists : [];
    },
    set(value) {
        boardStore.setLists(value);
    }
});

const socketWereDisconnected = ref(false);

const route = useRoute();
const router = useRouter();
const listsWrapper = ref();

/*
    Dragabble object events for board lists
*/
const onBoardListSortableMoveEnd = () => {
    if (board.value != null) {
        BoardAPI.updateBoardListsOrder(board.value);
    }
};

/**
 * On move end event handler for BoardList card.
 * This saves new card position into API if onCardMove successfull.
 * @param ev Vue draggable onMoveEnd event.
 */
const onCardSortableMoveEnd = async (ev: any) => {
    const cardId: number = parseInt(ev.item.getAttribute("data-id"));
    const listFromId: number = parseInt(ev.from.getAttribute("data-id"));
    const listToId: number = parseInt(ev.to.getAttribute("data-id"));

    /* FIXME: Hacky way to prevent card click event after move.
    The issue only appears when you move card inside a list
    If you move one list to other it's not an isssue
    */
    cardStore.setCardMoved(true);
    setTimeout(() => cardStore.setCardMoved(false), 30);

    if (listFromId !== listToId) {
        // Change list id of card.
        await CardAPI.patchCard(cardId, { list_id: listToId, position: ev.newIndex });

        const listFrom = board.value?.lists.find((el) => el.id == listFromId);
        if (listFrom) {
            await BoardListAPI.updateCardsOrder(listFrom);
        }
    }

    if (ev.oldIndex !== ev.newIndex || listFromId !== listToId) {
        const listTo = board.value?.lists.find((el) => el.id == listToId);
        if (listTo) {
            await BoardListAPI.updateCardsOrder(listTo);
        }
    }
};

/**
 * On move event handler for Boardlist card.
 * Detects if the WIP limit reached for the list.
 * @param ev Sortable move event 
 */
const onCardMove = (ev: any) => {
    const listToId: number = parseInt(ev.to.getAttribute("data-id"));
    const listFromId: number = parseInt(ev.from.getAttribute("data-id"));
    // Check target list WIP limit

    const list = boardStore.boardLists.find((el) => el.id === listToId);
    if (list) {
        if (list.wip_limit === list.cards.length && listToId !== listFromId) {
            return false;
        }
    }
};

const loadBoard = async (boardId: number) => {
    $q.loading.show({ delay: 400 });
    await boardStore.loadBoard({ boardId })
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

onBeforeRouteUpdate(async (to, from) => {
    boardStore.unLoadBoard();
    if (to.params.boardId !== from.params.boardId && typeof to.params.boardId === "string") {
        await loadBoard(parseInt(to.params.boardId));
        socket.emit("board_change", { board_id: to.params.boardId });
    }
});

onMounted(() => {
    if (typeof route.params.boardId === "string") {
        boardId.value = parseInt(route.params.boardId);
        /*
        Socket.IO handler for boards.
        */
        socket.on(SIOEvent.SIODisconnect, (reason) => {
            console.log(`Disconnected from SIO server reason: ${reason}`);
            socketWereDisconnected.value = true;
            if (reason !== "io client disconnect") {
                $q.notify({
                    message: "Connection lost to server",
                    type: "negative",
                    position: "bottom-right"
                });
            }

        });
        socket.on(SIOEvent.SIOConnect, async () => {
            console.log("Connected to server");
            await loadBoard(boardId.value);
            socket.emit("board_change", { board_id: route.params.boardId });
            if (socketWereDisconnected.value) {
                $q.notify({
                    message: "Reconnected",
                    type: "positive",
                    position: "bottom-right"
                });
                socketWereDisconnected.value = false;
            }
        });

        socket.on(SIOEvent.SIOError, SIOBoardEventListeners.onError);

        socket.onAny((event: string) => {
            console.debug(`[Socket.IO->BoardPage]: Got event: ${event}`);
        });

        socket.on(SIOEvent.BOARD_UPDATE, SIOBoardEventListeners.boardUpdate);
        socket.on(SIOEvent.BOARD_DELETE, SIOBoardEventListeners.boardDelete);

        socket.on(SIOEvent.CARD_NEW, SIOBoardEventListeners.newCard);
        socket.on(SIOEvent.CARD_REVERT, SIOBoardEventListeners.revertCard);
        socket.on(SIOEvent.CARD_UPDATE, SIOBoardEventListeners.cardUpdate);
        socket.on(SIOEvent.CARD_UPDATE_ORDER, SIOBoardEventListeners.cardOrderUpdate);
        socket.on(SIOEvent.CARD_ARCHIVE, SIOBoardEventListeners.cardArchive);
        socket.on(SIOEvent.CARD_DELETE, SIOBoardEventListeners.cardDelete);

        socket.on(SIOEvent.CARD_DATE_NEW, SIOBoardEventListeners.newCardDate);
        socket.on(SIOEvent.CARD_DATE_UPDATE, SIOBoardEventListeners.updateCardDate);
        socket.on(SIOEvent.CARD_DATE_DELETE, SIOBoardEventListeners.deleteCardDate);

        socket.on(SIOEvent.CARD_CHECKLIST_NEW, SIOBoardEventListeners.newCardChecklist);
        socket.on(SIOEvent.CARD_CHECKLIST_UPDATE, SIOBoardEventListeners.updateCardChecklist);
        socket.on(SIOEvent.CARD_CHECKLIST_DELETE, SIOBoardEventListeners.deleteCardChecklist);

        socket.on(SIOEvent.CHECKLIST_ITEM_NEW, SIOBoardEventListeners.newChecklistItem);
        socket.on(SIOEvent.CHECKLIST_ITEM_UPDATE, SIOBoardEventListeners.updateChecklistItem);
        socket.on(SIOEvent.CHECKLIST_ITEM_DELETE, SIOBoardEventListeners.deleteChecklistItem);

        socket.on(SIOEvent.CARD_MEMBER_ASSIGNED, SIOBoardEventListeners.cardMemberAssigned);
        socket.on(SIOEvent.CARD_MEMBER_DEASSIGNED, SIOBoardEventListeners.cardMemberDeAssigned);

        socket.on(SIOEvent.LIST_NEW, SIOBoardEventListeners.newList);
        socket.on(SIOEvent.LIST_REVERT, SIOBoardEventListeners.revertList);
        socket.on(SIOEvent.LIST_UPDATE_ORDER, SIOBoardEventListeners.listUpdateOrder);
        socket.on(SIOEvent.LIST_UPDATE, SIOBoardEventListeners.listUpdate);
        socket.on(SIOEvent.LIST_ARCHIVE, SIOBoardEventListeners.archiveList);
        socket.on(SIOEvent.LIST_DELETE, SIOBoardEventListeners.deleteList);

        if (!socket.connected)
            socket.connect();
    }
});


onUnmounted(() => {
    console.debug("[Socket.IO]: Leaving board route so disconnect from server.");
    boardStore.unLoadBoard();
    socket.disconnect();
});

</script>
<style lang="scss">
@import "../styles/board.scss";
</style>
