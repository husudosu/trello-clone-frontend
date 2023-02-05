<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card style="width: 400px;">
            <q-card-section>
                <q-toolbar color="primary">
                    <q-toolbar-title>Create new board</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
                <q-card-section>
                    <q-input ref="titleRef" v-model="boardTitle" label="Title *" hint="Title of board" lazy-rules
                        :rules="[val => val && val.length > 0 || 'Title is required']" />
                </q-card-section>
                <q-card-actions class="form_actions" align="right">
                    <q-btn type="submit" color="primary" class="full-width">Create</q-btn>
                </q-card-actions>

            </q-form>
        </q-card>
    </q-dialog>
</template>
<script lang="ts" setup>
import { ref, defineEmits } from 'vue';
import { useDialogPluginComponent } from 'quasar';

defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const boardTitle = ref("");

const onSubmit = async () => {
    onDialogOK({
        title: boardTitle.value
    });
};
</script>
