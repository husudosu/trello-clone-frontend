<template>
    <div>
        <span class="text-h6">
            {{ checklist.title }}
            <q-btn flat size="sm" dense class="q-ml-sm" @click="onChecklistDelete">
                <q-icon name="delete"></q-icon>
            </q-btn>
        </span>
        <div v-for="item in checklist.items" :key="item.id">
            <q-checkbox size="sm" v-model="item.completed" @update:model-value="onChecklistValueChanged(item)"
                :label="item.title">
            </q-checkbox>
            <q-btn flat size="sm" dense class="q-ml-sm" @click="onItemDelete(item)">
                <q-icon name="delete"></q-icon>
            </q-btn>
        </div>
        <q-input v-if="addNewItem" v-model="newItemTitle" type="textarea" autofocus autogrow
            placeholder="New item title" class="q-pa-sm"></q-input>
        <div v-if="addNewItem == false" class="q-mb-sm">
            <q-btn size="sm" @click="addNewItem = true" class="q-ma-sm">Add item</q-btn>
        </div>
        <div v-else class="q-mb-sm">
            <q-btn size="sm" color="primary" @click="onNewItemAdd" class="q-ma-sm">Add</q-btn>
            <q-btn size="sm" @click="addNewItem = false; newItemTitle = ''" class="q-ml-sm">Cancel</q-btn>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { defineProps, ref } from 'vue';
import { CardChecklist, ChecklistItem } from "@/api/types";
import store from "@/store";

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

const onItemDelete = (item: ChecklistItem) => {
    store.dispatch.card.deleteChecklistItem(item);
};
</script>
