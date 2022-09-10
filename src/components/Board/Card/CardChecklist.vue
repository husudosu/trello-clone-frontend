<template>
    <div>
        <span class="text-h6">
            {{ checklist.title || "Untitled"}}
            <q-btn v-if="hasPermission(BoardPermission.CHECKLIST_EDIT)" flat size="sm" dense class="q-ml-sm"
                @click="onChecklistDelete">
                <q-icon name="delete"></q-icon>
            </q-btn>
        </span>
        <draggable :list="checklist.items" itemKey="id" :delayOnTouchOnly="true" :touchStartThreshold="100" :delay="500"
            group="checklist-items" @end="onItemMoveEnd">
            <template #item="{ element }">
                <div class="checklistItem">
                    <q-checkbox size="sm" v-model="element.completed"
                        @update:model-value="onChecklistValueChanged(element)" :label="element.title"
                        :disable="!hasPermission(BoardPermission.CHECKLIST_ITEM_MARK)">
                    </q-checkbox>
                    <q-btn v-if="hasPermission(BoardPermission.CHECKLIST_EDIT)" flat size="sm" dense class="q-ml-sm"
                        @click="onItemDelete(element)">
                        <q-icon name="delete"></q-icon>
                    </q-btn>
                </div>
            </template>
        </draggable>
        <q-input :disable="!hasPermission(BoardPermission.CHECKLIST_EDIT)" v-if="addNewItem" v-model="newItemTitle"
            type="textarea" autofocus autogrow placeholder="New item title" class="q-pa-sm"
            @keyup.enter="onItemTitleKeyup"></q-input>
        <div v-if="addNewItem == false" class="q-mb-sm">
            <q-btn v-if="hasPermission(BoardPermission.CHECKLIST_EDIT)" size="sm" @click="addNewItem = true"
                class="q-ma-sm">Add item</q-btn>
        </div>
        <div v-else class="q-mb-sm">
            <q-btn size="sm" color="primary" @click="onNewItemAdd" class="q-ma-sm">Add</q-btn>
            <q-btn size="sm" @click="addNewItem = false; newItemTitle = ''" class="q-ml-sm">Cancel</q-btn>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { defineProps, ref } from 'vue';
import { CardChecklist, ChecklistItem, BoardPermission } from "@/api/types";

import draggable from 'vuedraggable';

import store from "@/store";
import { ChecklistAPI } from '@/api/checklist';

const hasPermission = store.getters.board.hasPermission;

interface Props {
    checklist: CardChecklist;
}

const props = defineProps<Props>();
const checklist = ref(props.checklist);

const addNewItem = ref(false);
const newItemTitle = ref("");

const onChecklistValueChanged = (item: ChecklistItem) => {
    store.dispatch.card.markChecklistItem(item);
};

const onChecklistDelete = () => {
    if (confirm("Delete checklist?")) {
        store.dispatch.card.deleteCardChecklist(checklist.value);
    }
};

const onNewItemAdd = () => {
    store.dispatch.card.addChecklistItem({ checklistId: checklist.value.id, item: { title: newItemTitle.value, completed: false } })
        .then(() => {
            addNewItem.value = false;
            newItemTitle.value = "";
        });
};

const onItemTitleKeyup = (event: KeyboardEvent) => {
    if (event.ctrlKey) onNewItemAdd();
};


const onItemMoveEnd = () => {
    ChecklistAPI.updateItemsOrder(checklist.value);
};

const onItemDelete = (item: ChecklistItem) => {
    store.dispatch.card.deleteChecklistItem(item);
};
</script>
