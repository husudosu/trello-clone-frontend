<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" :fullWidth="true" :fullHeight="true" :maximized="$q.screen.xs">
        <q-card class="q-dialog-plugin">
            <q-card-section>
                <q-toolbar color="primary">
                    <q-toolbar-title>Members</q-toolbar-title>
                    <q-btn flat round dense icon="close" @click="onDialogCancel" />
                </q-toolbar>
            </q-card-section>

            <q-card-section>
                <q-list padding bordered separator>
                    <q-item v-for="member in boardMembers" :key="member.id">
                        <q-item-section avatar>
                            <user-avatar size="md" :user="member.user" :show-tooltip="false"></user-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label :style="{'text-decoration': member.is_deleted ? 'line-through' : 'auto'}">{{
                            member.user.name }} ({{
                                member.user.username }})</q-item-label>
                        </q-item-section>
                        <q-item-section top side>
                            <div class="text-grey-8 q-gutter-xs row">
                                <q-select style="width: 150px;" item-aligned v-model="member.role" label="Role"
                                    :options="boardRoles" option-value="id" option-label="name" map-options dense
                                    @update:model-value="onRoleChange($event, member)"
                                    :disable="!isAdmin || boardUser?.user_id === member.user_id || member.is_deleted">
                                    <template v-slot:selected-item="scope">
                                        <span class="ellipsis">{{ scope.opt.name }}</span>
                                    </template>
                                </q-select>
                                <q-btn v-if="member.is_deleted && isAdmin" class="gt-xs" flat dense round icon="done"
                                    @click="onActivateUserClicked(member)" color="positive"
                                    :disable="!isAdmin || boardUser?.user_id === member.user_id">
                                </q-btn>
                                <q-btn class="gt-xs" flat dense round icon="delete" @click="onDeleteClicked(member)"
                                    :disable="!isAdmin || boardUser?.user_id === member.user_id">
                                </q-btn>
                            </div>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { ref, defineEmits, computed } from "vue";
import { useDialogPluginComponent } from 'quasar';
import { useQuasar } from "quasar";
import { BoardAPI } from "@/api/board";
import store from "@/store/index";
import { BoardAllowedUser, BoardRole } from "@/api/types";
import UserAvatar from "../UserAvatar.vue";

const boardRoles = computed(() => store.state.board.roles);
const boardUser = computed(() => store.getters.board.boardUser);
const isAdmin = computed(() => store.getters.board.isAdmin);
const $q = useQuasar();
defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();
const boardMembers = ref<BoardAllowedUser[]>([]);

if (store.state.board.board) {
    BoardAPI.getBoardMembers(store.state.board.board.id).then((data) => {
        boardMembers.value = data;
    });
}

const onRoleChange = async (role: BoardRole, member: BoardAllowedUser) => {
    BoardAPI.updateBoardMemberRole(member.board_id, member.user_id, role.id);
};

const onDeleteClicked = async (member: BoardAllowedUser) => {
    $q.dialog({
        title: "Delete member?",
        cancel: true,
        persistent: true,
        message: !member.is_deleted ?
            `This gonna remove access for ${member.user.name || member.user.username} to board, but the user activity stays on database.` :
            `This gonna delete all activities which created by ${member.user.name || member.user.username}. Are you sure?`,
        ok: {
            label: "Remove",
            color: "negative"
        }
    }).onOk(() => {
        BoardAPI.deleteBoardMember(member.board_id, member.user_id);
        // FIXME: Refresh the store, not reload the whole page FFS.
        window.location.reload();
    });
};

const onActivateUserClicked = async (member: BoardAllowedUser) => {
    $q.dialog({
        title: "Activate member?",
        cancel: true,
        persistent: true,
        message: `If you activate ${member.user.name || member.user.username} can access this board.`,
        ok: {
            label: "Activate",
        }
    }).onOk(() => {
        // BoardAPI.deleteBoardMember(member.board_id, member.user_id);
        BoardAPI.activateMember(member.id);
        // FIXME: Refresh the store, not reload the whole page FFS.
        window.location.reload();
    });
};
</script>