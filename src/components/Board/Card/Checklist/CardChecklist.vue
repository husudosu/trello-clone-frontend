<template>
    <div>
        <template v-if="!editTitle">
            <div class="row justify-between">
                <span class="text-h6" @dblclick="editTitle = true">
                    {{ props.checklist.title || "Untitled" }}

                </span>
                <q-btn v-if="hasPermission(BoardPermission.CHECKLIST_EDIT)" flat size="sm" dense class="q-ml-sm"
                    @click="onChecklistDelete">
                    <q-icon name="delete"></q-icon>
                </q-btn>
            </div>
        </template>
        <template v-else>
            <q-input v-model="newTitle" dense @blur="editTitle = false; newTitle = checklist.title" autofocus
                @keyup.enter="onTitleKeyUp"></q-input>
        </template>
        <q-list dense>
            <draggable :list="props.checklist.items" itemKey="id" :delayOnTouchOnly="true" :touchStartThreshold="100"
                :delay="500" group="checklist-items" @end="onItemMoveEnd">
                <template #item="{ element }">
                    <checklist-item :item="element"></checklist-item>
                </template>
            </draggable>
        </q-list>
        <q-input :disable="!hasPermission(BoardPermission.CHECKLIST_EDIT)" v-if="addNewItem" v-model="newItemTitle"
            type="textarea" autofocus autogrow placeholder="New item title" class="q-pa-sm"
            @keyup.enter="onItemTitleKeyup"></q-input>
        <div v-if="addNewItem == false" class="q-mb-sm">
            <q-btn v-if="hasPermission(BoardPermission.CHECKLIST_EDIT)" size="sm" @click="addNewItem = true"
                class="q-ma-sm" color="primary">Add item</q-btn>
        </div>
        <div v-else class="q-mb-sm">
            <q-btn size="sm" color="primary" @click="onNewItemAdd" class="q-ma-sm">Add</q-btn>
            <q-btn size="sm" @click="addNewItem = false; newItemTitle = ''" class="q-ml-sm">Cancel</q-btn>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { defineProps, ref } from 'vue';
import { CardChecklist, BoardPermission } from "@/api/types";
import { useQuasar } from 'quasar';

import draggable from 'vuedraggable';

import store from "@/store";
import { ChecklistAPI } from '@/api/checklist';
import ChecklistItem from './ChecklistItem.vue';

const $q = useQuasar();
const hasPermission = store.getters.board.hasPermission;

interface Props {
    checklist: CardChecklist;
}

const props = defineProps<Props>();
const checklist = ref(props.checklist);

const addNewItem = ref(false);
const newItemTitle = ref("");

const editTitle = ref(false);
const newTitle = ref(checklist.value.title);

const onChecklistDelete = () => {
    $q.dialog({
        title: "Delete checklist",
        cancel: true,
        persistent: true,
        message: `Delete checklist ${checklist.value.title}?`,
        ok: {
            label: "Delete",
            color: "negative"
        }
    }).onOk(() => {
        store.dispatch.card.deleteCardChecklist(checklist.value);
    });
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

const updateTitle = () => {
    editTitle.value = false;
    ChecklistAPI.patchCardChecklist(props.checklist.id, { ...checklist.value, title: newTitle.value });
};

const onTitleKeyUp = (ev: KeyboardEvent) => {
    if (ev.ctrlKey) {
        updateTitle();
    }
};
</script>
