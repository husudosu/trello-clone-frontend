<template>
    <div class="infoContainer">

        <q-markup-table dense flat>
            <tbody>
                <tr>
                    <td class="text-bold">Board name</td>
                    <td>
                        <q-input :disable="!hasPermission(BoardPermission.BOARD_UPDATE)" v-model="newBoardTitle" dense>
                        </q-input>
                    </td>
                </tr>
            </tbody>
        </q-markup-table>
        <q-separator class="q-mt-sm q-mb-sm"></q-separator>
        <div class="row">
            <q-btn :disable="!boardStore.boardUser?.is_owner" @click="onDeleteBoardClicked">
                {{ boardStore.board?.archived ? 'Delete board' : 'Archive board' }}
            </q-btn>
            <q-btn class="q-ml-sm" v-if="(boardStore.board?.archived && boardStore.boardUser?.is_owner)"
                @click="onRevertBoardClicked">
                Revert board
            </q-btn>
            <span v-if="!boardStore.boardUser?.is_owner" class="q-ml-sm">Only {{
                boardStore.owner?.user.name
            }} ({{ boardStore.owner?.user.username }}) can
                delete this
                board!</span>
        </div>
        <div class="row">
            <q-btn color="primary" :disable="!hasPermission(BoardPermission.BOARD_UPDATE)" @click="onSubmit"
                class="full-width  q-mt-md ">Save
            </q-btn>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { BoardPermission } from "@/api/types";
import { BoardAPI } from "@/api/board";
import { useQuasar } from "quasar";
import router from "@/router";
import { useBoardStore } from "@/stores/board";

const boardStore = useBoardStore();

const hasPermission = boardStore.hasPermission;
const newBoardTitle = ref(boardStore.board?.title);
const board = boardStore.board;
const $q = useQuasar();

const onSubmit = () => {
    if (boardStore.board) {
        BoardAPI.patchBoard(boardStore.board.id, { title: newBoardTitle.value });
        $q.notify({
            message: "Board updated",
            type: "positive",
            position: "top"
        });
    }
};

const onDeleteBoardClicked = () => {
    const action = board && board.archived ? "Delete" : "Archive";
    $q.dialog({
        title: `${action} board`,
        cancel: true,
        persistent: true,
        message: `${action} ${board?.title}?`,
        ok: {
            label: action,
            color: "negative"
        }
    }).onOk(() => {
        if (board) {
            boardStore.removeBoard(board.id)
                .then(() => { router.push({ name: "boards" }); });
        }
    });
};

const onRevertBoardClicked = () => {
    $q.dialog({
        title: "Revert board",
        cancel: true,
        persistent: true,
        message: `Revert board ${board?.title}?`,
        ok: {
            label: "Revert",
        }
    }).onOk(async () => {
        if (board) {
            const revertedBoard = await BoardAPI.revertBoard(board.id);
            boardStore.addBoard(revertedBoard);
        }
    });
};
</script> 

<style lang="scss" >
$toolbar_height: 200px;

.infoContainer {
    height: calc(100vh - #{$toolbar_height});
}
</style>