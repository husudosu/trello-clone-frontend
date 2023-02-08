<template>
    <div>
        <div class="row">
            <q-space></q-space>
            <q-btn icon="add" color="secondary" class="q-mb-md" @click="onAddMemberClicked"
                :disable="!boardStore.isAdmin">Add member</q-btn>
        </div>
        <q-list padding bordered separator>
            <q-item v-for="member in boardMembers" :key="member.id">
                <q-item-section avatar>
                    <user-avatar size="md" :user="member.user" :show-tooltip="false"></user-avatar>
                </q-item-section>
                <q-item-section>
                    <q-item-label :style="{ 'text-decoration': member.is_deleted ? 'line-through' : 'auto' }">{{
                        member.user.name
                    }} ({{
    member.user.username
}})</q-item-label>
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
    </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";

import { useQuasar } from "quasar";
import { BoardAPI } from "@/api/board";
import { BoardPermission, IBoardAllowedUser, IBoardRole } from "@/api/types";
import UserAvatar from "@/components/UserAvatar.vue";
import AddMemberDialog from "../AddMemberDialog.vue";
import { useBoardStore } from "@/stores/board";

const boardStore = useBoardStore();

const boardRoles = computed(() => boardStore.roles);
const boardUser = computed(() => boardStore.boardUser);
const isAdmin = computed(() => boardStore.isAdmin);
const $q = useQuasar();

const boardMembers = ref<IBoardAllowedUser[]>([]);

if (boardStore.board) {
    BoardAPI.getBoardMembers(boardStore.board.id).then((data) => {
        boardMembers.value = data;
    });
}

const onRoleChange = async (role: IBoardRole, member: IBoardAllowedUser) => {
    BoardAPI.updateBoardMemberRole(member.board_id, member.user_id, role.id);
};

const onDeleteClicked = async (member: IBoardAllowedUser) => {
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
    }).onOk(async () => {
        await BoardAPI.deleteBoardMember(member.board_id, member.user_id);
        // FIXME: Refresh the store, not reload the whole page FFS.
        window.location.reload();
    });
};

const onActivateUserClicked = async (member: IBoardAllowedUser) => {
    $q.dialog({
        title: "Activate member?",
        cancel: true,
        persistent: true,
        message: `If you activate ${member.user.name || member.user.username} can access this board.`,
        ok: {
            label: "Activate",
        }
    }).onOk(async () => {
        // BoardAPI.deleteBoardMember(member.board_id, member.user_id);
        await BoardAPI.activateMember(member.id);
        // FIXME: Refresh the store, not reload the whole page FFS.
        window.location.reload();
    });
};

const onAddMemberClicked = () => {
    $q.dialog({
        component: AddMemberDialog
    }).onOk(async (data) => {
        if (boardStore.board) {
            const member = await BoardAPI.addBoardMember(boardStore.board.id, data);
            boardMembers.value.push(member);
        }
    });
};
</script>