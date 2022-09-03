<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" :fullWidth="true" :fullHeight="true">
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
                            <q-avatar rounded>
                                <img src="@/assets/avatar-placeholder.png" />
                            </q-avatar>
                        </q-item-section>
                        <q-item-section>
                            <q-item-label>{{ member.user.name }} ({{ member.user.username }})</q-item-label>
                        </q-item-section>
                        <q-item-section top side>
                            <div class="text-grey-8 q-gutter-xs row">
                                <q-select style="width: 150px;" item-aligned v-model="member.role" label="Role"
                                    :options="boardRoles" option-value="id" option-label="name" map-options dense
                                    @update:model-value="onRoleChange($event, member)"
                                    :disable="!isAdmin || boardUser?.user_id === member.user_id">
                                    <template v-slot:selected-item="scope">
                                        <span class="ellipsis">{{ scope.opt.name }}</span>
                                    </template>
                                </q-select>
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
import { BoardAPI } from "@/api/board";
import store from "@/store/index";
import { BoardAllowedUser, BoardRole } from "@/api/types";

const boardRoles = computed(() => store.state.board.roles);
const boardUser = computed(() => store.getters.board.boardUser);
const isAdmin = computed(() => store.getters.board.isAdmin);
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
    if (confirm("Delete member?")) {
        try {
            BoardAPI.deleteBoardMember(member.board_id, member.user_id);
        }
        catch (err) {
            console.log(err);
        }
    }
};
</script>