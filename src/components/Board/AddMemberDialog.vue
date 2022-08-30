<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-card-section>
                <q-toolbar color="primary">
                    <q-toolbar-title>Add member</q-toolbar-title>
                    <q-btn flat round dense icon="close" @click="onDialogCancel" />
                </q-toolbar>
            </q-card-section>
            <q-form ref="form" @submit.prevent.stop="onAddMemberSubmit" class="q-gutter-md">
                <q-card-section>
                    <q-input v-model="addMemberFormUsername" label="User *" hint="Username or Email"
                        :rules="[validateUser]" debounce="300" autofocus />
                    <q-select v-model="addMemberForm.board_role_id" label="Role *" hint="Role" :options="boardRoles"
                        option-value="id" option-label="name" emit-value map-options
                        :rules="[val => !!val || 'Role required!']">
                    </q-select>
                </q-card-section>
                <q-card-actions class="form_actions" align="right">
                    <q-btn type="submit" color="primary" class="full-width">Add member</q-btn>
                </q-card-actions>
            </q-form>

        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>

import { ref, computed, defineEmits } from "vue";
import { useDialogPluginComponent } from 'quasar';
import store from "@/store/index";

import { findUser } from "@/api/user";
import { addBoardMember, getBoardMember } from "@/api/board";

defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

// FIXME: Fix types here!
const addMemberForm = ref({
    user_id: null as any,
    board_role_id: null as any,
});

const addMemberFormUsername = ref("");
const boardRoles = computed(() => store.state.board.roles);
const form = ref();

const onAddMemberSubmit = () => {
    form.value.validate().then((success: boolean) => {
        if (success && store.state.board.board) {
            addBoardMember(store.state.board.board.id, addMemberForm.value);
            onDialogOK();
        }
    });
};

/*
Validates if user exists
if exists puts user id into addMemberForm
*/
const validateUser = (val: string): Promise<string | boolean> => {
    return new Promise((resolve) => {
        if (val.length > 0) {
            findUser(val).then((data) => {
                addMemberForm.value.user_id = data.id;
                if (store.state.board.board) {
                    // If board member returns 404 we good to go!
                    getBoardMember(store.state.board.board.id, data.id).then(() => {
                        resolve("Member already exists!");
                    }).catch(() => resolve(true));
                }
            }).catch(() => {
                resolve("User not found");
            });
        }
        else resolve("Username required!");
    });
};
</script>