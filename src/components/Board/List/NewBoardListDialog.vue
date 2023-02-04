<template>
    <q-dialog @hide="onDialogHide" ref="dialogRef" persistent>
        <q-card style="width: 400px;">
            <q-card-section>
                <q-toolbar color="primary">
                    <q-toolbar-title>{{!props.boardList ? 'New list' : 'Update list'}} </q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
                <q-card-section>
                    <q-input v-model="listTitle" label="Title *" lazyRules
                        :rules="[val => val && val.length > 0 || 'Title required!']" />
                    <q-input v-model="listWIPLimit" label="WIP limit" type="number" :rules=[validateWIPLimit] />
                </q-card-section>

                <q-card-actions align="right" class="form_actions">
                    <q-btn @click="onDialogCancel">Cancel</q-btn>
                    <q-btn type="submit" color="primary">
                        {{
                        !props.boardList ? 'Add' : 'Update'
                        }}
                    </q-btn>
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>

import { defineEmits, ref, withDefaults, defineProps, onMounted } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { useBoardStore } from '@/stores/board';
import { IBoardList } from '@/api/types';

defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
const props = withDefaults(defineProps<{ boardList: IBoardList | null; }>(), { boardList: null });

const boardStore = useBoardStore();

const listTitle = ref("");
const listWIPLimit = ref(-1);

const onSubmit = async () => {
    if (boardStore.board) {
        onDialogOK({
            board_id: boardStore.board.id,
            archived: false,
            title: listTitle.value,
            wip_limit: listWIPLimit.value
        });
    }
};

const validateWIPLimit = (val: number): Promise<string | boolean> => {
    return new Promise((resolve) => {
        if (!props.boardList) resolve(true);
        else if (props.boardList.cards.length > val) resolve("You cannot have lower WIP limit than current card count!");
        else resolve(true);
    });
};

onMounted(() => {
    if (props.boardList) {
        listTitle.value = props.boardList.title;
        listWIPLimit.value = props.boardList.wip_limit;
    }
});
</script>

<style>
.form_actions button {
    width: 100px;
}
</style>