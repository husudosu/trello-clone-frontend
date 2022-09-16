<template>
    <q-item dense style="padding-left: 0px;">
        <q-tooltip v-if="props.item.marked_complete_user">
            Done by <b>{{ props.item.marked_complete_user.user.name || props.item.marked_complete_user.user.username
            }}</b> on <b>{{ props.item.marked_complete_on ?
                props.item.marked_complete_on.format("YYYY-MM-DD HH:mm:ss") : "N/A"}}</b>
        </q-tooltip>
        <q-item-section avatar top>
            <q-checkbox v-model="item.completed" size="sm" @update:model-value="onChecklistValueChanged"
                :disable="!hasPermission(BoardPermission.CHECKLIST_ITEM_MARK)" />
        </q-item-section>
        <q-item-section>
            <q-item-label :class="{checklistItemLabel: true, checklistItemDone: props.item.completed }" v-if="!editItem"
                @click="onChecklistItemClicked">
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
                    @click="onAssignMember()">
                    <q-icon name="person"></q-icon>
                </q-btn>
                <q-btn v-if="hasPermission(BoardPermission.CHECKLIST_EDIT)" flat size="sm" dense class="q-ml-xs"
                    @click="onAssignDueDate()">
                    <q-icon name="schedule"></q-icon>
                </q-btn>
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
import store from "@/store";
import { ChecklistItem, BoardPermission } from "@/api/types";
const hasPermission = store.getters.board.hasPermission;

interface Props {
    item: ChecklistItem;
}

const props = defineProps<Props>();
const item = ref(props.item);
const editItem = ref(false);
const newItemTitle = ref(props.item.title);

const onChecklistValueChanged = () => {
    store.dispatch.card.markChecklistItem(item.value);
};

const onChecklistItemClicked = () => {
    editItem.value = true;
};

const dissmisTitleChange = (ev: any) => {
    ev.stopPropagation();
    editItem.value = false;
    newItemTitle.value = props.item.title;
};

const saveTitleChange = () => {
    store.dispatch.card.updateChecklistItem({ ...item.value, title: newItemTitle.value });
    editItem.value = false;
};

const onItemDelete = () => {
    store.dispatch.card.deleteChecklistItem(item.value);
};

const onAssignMember = () => {
    console.log(item.value);
    alert("Not implemented yet");
};

const onAssignDueDate = () => {
    console.log(item.value);
    alert("Not implemented yet");
};
</script>