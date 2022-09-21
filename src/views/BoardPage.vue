<template>
    <div class="ui" ref="boardWrapper">
        <!-- Car details -->
        <card-details-dialog></card-details-dialog>
        <!-- Add member dialog -->
        <nav class="navbar board">
            {{ board?.title }}
            <div class="row boardButtons">
                <q-btn class="q-ml-lg btn" flat @click=" onDeleteBoardClicked"
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
            <draggable v-model="boardLists" itemKey="id" :delayOnTouchOnly="true" :touchStartThreshold="100"
                :delay="500" @end="onBoardListSortableMoveEnd" group="board-list" handle=".listHeader"
                style="display:flex" direction="horizontal" :scroll-sensitivity="170" :fallback-tolerance="1"
                :force-fallback="true" :animation="200">
                <!-- Board list object and reorder handling of cards.-->
                <template #item="{ element }">
                    <board-list :onMove="onCardMove" :onEnd="onCardSortableMoveEnd" :boardList="element">
                    </board-list>
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
                    <draft-board-list :boardId="board.id" :onCancel="() => {showAddDraftList = false}"
                        :onSaveSuccess="() => {showAddDraftList = false}"></draft-board-list>
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
import BoardList from "@/components/Board/List/BoardList.vue";
import AddMemberDialog from "@/components/Board/AddMemberDialog.vue";
import MembersDialog from "@/components/Board/MembersDialog.vue";
import DraftBoardList from "@/components/Board/List/DraftBoardList.vue";

const $q = useQuasar();

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

let cardId: number | undefined;
/*
    Dragabble object events for board lists
*/
const onBoardListSortableMoveEnd = () => {
    if (board.value != null) {
        BoardAPI.updateBoardListsOrder(board.value);
    }
};

/*
    Draggable object events for cards
    FIXME: Structrue wise not so ideal to store these methods here.
*/
const onCardSortableMoveEnd = async (ev: any) => {
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
};

const onCardMove = async (ev: any) => {
    cardId = ev.draggedContext.element.id;
};

const loadBoard = (boardId: number) => {
    store.dispatch.board.loadBoard({ boardId })
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

onBeforeRouteUpdate((to, from) => {
    store.commit.board.unLoadBoard();
    if (to.params.boardId !== from.params.boardId && typeof to.params.boardId === "string") {
        loadBoard(parseInt(to.params.boardId));
    }
});

onMounted(() => {
    if (typeof route.params.boardId === "string") {
        loadBoard(parseInt(route.params.boardId));
    }
})

</script>
<style lang="scss">
@import "../styles/board.scss";
</style>
