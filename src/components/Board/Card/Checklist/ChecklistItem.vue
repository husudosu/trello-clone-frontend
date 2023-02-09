<template>
    <q-item dense style="padding-left: 0px;">
        <q-tooltip v-if="props.item.marked_complete_user">
            Done by <b>{{
                props.item.marked_complete_user.user.name || props.item.marked_complete_user.user.username
            }}</b> on <b>{{
    props.item.marked_complete_on ?
        props.item.marked_complete_on.format("YYYY-MM-DD HH:mm:ss") : "N/A"
}}</b>
        </q-tooltip>
        <q-item-section avatar top>
            <q-checkbox :model-value="props.item.completed" size="sm" @update:model-value="onChecklistValueChanged"
                :disable="!hasPermission(BoardPermission.CHECKLIST_ITEM_MARK)" />
        </q-item-section>
        <q-item-section>
            <q-item-label :class="{ checklistItemLabel: true, checklistItemDone: props.item.completed }"
                v-if="!editItem" @click="onChecklistItemClicked">
                {{ props.item.title }}
            </q-item-label>
            <q-item-label v-else>
                <q-input dense v-model="newItemTitle" autofocus @keyup.esc="dissmisTitleChange"
                    @blur="dissmisTitleChange" @keyup.enter="saveTitleChange">
                </q-input>
            </q-item-label>
        </q-item-section>
        <q-item-section side>
            <div class="row">
                <q-btn v-if="hasPermission(BoardPermission.CHECKLIST_EDIT)" flat size="sm" dense class="q-ml-xs"
                    @click="onItemDelete()">
                    <q-icon name="delete"></q-icon>
                </q-btn>
            </div>
        </q-item-section>
    </q-item>
</template>
<script lang="ts" setup>
import { defineProps, ref } from 'vue';
import { IChecklistItem, BoardPermission } from "@/api/types";
import { ChecklistAPI } from '@/api/checklist';
import { useBoardStore } from '@/stores/board';

const boardStore = useBoardStore();
const hasPermission = boardStore.hasPermission;

interface Props {
    item: IChecklistItem;
}

const props = defineProps<Props>();
const editItem = ref(false);
const newItemTitle = ref(props.item.title);

const onChecklistValueChanged = () => {
    ChecklistAPI.patchChecklistItem(props.item.id, { completed: !props.item.completed });
};

const onChecklistItemClicked = () => {
    editItem.value = true;
};

const dissmisTitleChange = (ev: Event) => {
    ev.stopPropagation();
    editItem.value = false;
    newItemTitle.value = props.item.title;
};

const saveTitleChange = () => {
    ChecklistAPI.patchChecklistItem(props.item.id, { title: newItemTitle.value });
    editItem.value = false;
};

const onItemDelete = () => {
    ChecklistAPI.deleteChecklistItem(props.item.id);
};

</script>