<template>
    <q-dialog @hide="onDialogHide" ref="dialogRef" persistent>
        <q-card style="width: 400px;">
            <q-card-section>
                <q-toolbar color="primary">
                    <q-toolbar-title>New list</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
                <q-card-section>
                    <q-input v-model="listTitle" label="Title *" lazyRules
                        :rules="[val => val && val.length > 0 || 'Title required!']" />
                    <q-input v-model="listWIPLimit" label="WIP limit" type="number" />
                </q-card-section>

                <q-card-actions align="right" class="form_actions">
                    <q-btn @click="onDialogCancel">Cancel</q-btn>
                    <q-btn type="submit" color="primary">Add</q-btn>
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>

import { defineEmits, ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useBoardStore } from '@/stores/board';
defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

const boardStore = useBoardStore();

const listTitle = ref("");
const listWIPLimit = ref(-1);

const onSubmit = async () => {
    if (boardStore.board) {
        // TODO: List WIP limit
        onDialogOK({
            board_id: boardStore.board.id,
            archived: false,
            title: listTitle.value,
            wip_limit: listWIPLimit.value
        });
    }
};
</script>

<style>
.form_actions button {
    width: 100px;
}
</style>