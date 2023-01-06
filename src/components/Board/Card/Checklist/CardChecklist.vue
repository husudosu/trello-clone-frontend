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
            <q-input v-model="newTitle" dense @blur="editTitle = false; newTitle = props.checklist.title" autofocus
                @keyup.enter="onTitleKeyUp"></q-input>
        </template>
        <q-list dense>
            <draggable :list="checklist.items" itemKey="id" :delayOnTouchOnly="true" :touchStartThreshold="100"
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
import { ICardChecklist, BoardPermission } from "@/api/types";
import { useQuasar } from 'quasar';

import draggable from 'vuedraggable';

import { ChecklistAPI } from '@/api/checklist';
import ChecklistItem from './ChecklistItem.vue';
import { useBoardStore } from '@/stores/board';

const boardStore = useBoardStore();
const $q = useQuasar();
const hasPermission = boardStore.hasPermission;

const props = defineProps<{ checklist: ICardChecklist; }>();

const addNewItem = ref(false);
const newItemTitle = ref("");
const editTitle = ref(false);
const newTitle = ref(props.checklist.title);

const onChecklistDelete = () => {
    $q.dialog({
        title: "Delete checklist",
        cancel: true,
        persistent: true,
        message: `Delete checklist ${props.checklist.title}?`,
        ok: {
            label: "Delete",
            color: "negative"
        }
    }).onOk(() => {
        ChecklistAPI.deleteCardchecklist(props.checklist.id);
    });
};

const onNewItemAdd = async () => {
    try {
        addNewItem.value = false;
        await ChecklistAPI.postChecklistItem(props.checklist.id, { title: newItemTitle.value, completed: false });
    }
    catch (err) {
        console.log(err);
    }
    finally {
        newItemTitle.value = "";
    }
};

const onItemTitleKeyup = async (event: KeyboardEvent) => {
    if (event.ctrlKey) await onNewItemAdd();
};


const onItemMoveEnd = () => {
    ChecklistAPI.updateItemsOrder(props.checklist);
};

const updateTitle = () => {
    editTitle.value = false;
    ChecklistAPI.patchCardChecklist(props.checklist.id, { title: newTitle.value });
};

const onTitleKeyUp = (ev: KeyboardEvent) => {
    if (ev.ctrlKey) {
        updateTitle();
    }
};
</script>
