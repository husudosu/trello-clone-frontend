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
                    <q-input v-model="listWIPLimit" label="WIP limit" type="number" :rules=[validateWIPLimit]
                        hint="-1 means no WIP limit set" />
                    <q-list class="non-selectable">
                        <q-item v-ripple>
                            <q-item-section>Header background</q-item-section>
                            <q-item-section avatar>
                                <div
                                    :style="{ backgroundColor: listHeaderBackgroundColor, width: '24px', height: '24px', border: '1px solid' }">
                                </div>
                            </q-item-section>
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-color v-model="listHeaderBackgroundColor" defaultValue="#ffffff"
                                    formatModel="rgba" />
                            </q-popup-proxy>
                        </q-item>
                        <q-item v-ripple>
                            <q-item-section>Header text</q-item-section>
                            <q-item-section avatar>
                                <div
                                    :style="{ backgroundColor: listHeaderTextColor, width: '24px', height: '24px', border: '1px solid' }">
                                </div>
                            </q-item-section>
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-color v-model="listHeaderTextColor" defaultValue="#ffffff" formatModel="rgba" />
                            </q-popup-proxy>
                        </q-item>
                        <q-item v-ripple>
                            <q-item-section>List background</q-item-section>
                            <q-item-section avatar>
                                <div
                                    :style="{ backgroundColor: listBackgroundColor, width: '24px', height: '24px', border: '1px solid' }">
                                </div>
                            </q-item-section>
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-color v-model="listBackgroundColor" defaultValue="#ffffff" formatModel="rgba" />
                            </q-popup-proxy>
                        </q-item>
                        <q-item v-ripple>
                            <q-item-section>List text</q-item-section>
                            <q-item-section avatar>
                                <div
                                    :style="{ backgroundColor: listTextcolor, width: '24px', height: '24px', border: '1px solid' }">
                                </div>
                            </q-item-section>
                            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                <q-color v-model="listTextcolor" defaultValue="#ffffff" formatModel="rgba" />
                            </q-popup-proxy>
                        </q-item>

                    </q-list>
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
const props = withDefaults(defineProps<{ boardList?: IBoardList | null; }>(), { boardList: null });

const boardStore = useBoardStore();

const listTitle = ref("");
const listWIPLimit = ref(-1);
const listHeaderTextColor = ref("#fff");
const listHeaderBackgroundColor = ref("##0d344e");
const listTextcolor = ref("#fff");
const listBackgroundColor = ref("");


const onSubmit = async () => {
    if (boardStore.board) {
        onDialogOK({
            board_id: boardStore.board.id,
            archived: false,
            title: listTitle.value,
            wip_limit: listWIPLimit.value,
            header_textcolor: listHeaderTextColor.value,
            header_bgcolor: listHeaderBackgroundColor.value,
            list_bgcolor: listBackgroundColor.value,
            list_textcolor: listTextcolor.value
        });
    }
};

const validateWIPLimit = (val: number): Promise<string | boolean> => {
    return new Promise((resolve) => {
        if (!props.boardList || val == -1) resolve(true);
        else if (props.boardList.cards.length > val) resolve("You cannot have lower WIP limit than current card count!");
        else resolve(true);
    });
};

onMounted(() => {
    if (props.boardList) {
        listTitle.value = props.boardList.title;
        listWIPLimit.value = props.boardList.wip_limit;
        listHeaderTextColor.value = props.boardList.header_textcolor;
        listHeaderBackgroundColor.value = props.boardList.header_bgcolor;

        listTextcolor.value = props.boardList.list_textcolor;
        listBackgroundColor.value = props.boardList.list_bgcolor;
    }
});
</script>

<style>
.form_actions button {
    width: 100px;
}
</style>