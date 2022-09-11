<template>
    <q-item tag="label" dense style="padding-left: 0px;">
        <q-tooltip v-if="props.item.marked_complete_user">
            Done by <b>{{ props.item.marked_complete_user.name }}</b> on <b>{{ props.item.marked_complete_on ?
            props.item.marked_complete_on.format("YYYY-MM-DD HH:mm:ss") : "N/A"}}</b>
        </q-tooltip>
        <q-item-section avatar top>
            <q-checkbox v-model="item.completed" size="sm" @update:model-value="onChecklistValueChanged()"
                :disable="!hasPermission(BoardPermission.CHECKLIST_ITEM_MARK)" />
        </q-item-section>
        <q-item-section>
            <q-item-label :class="{checklistItemLabel: true, checklistItemDone: props.item.completed }">
                {{ props.item.title }}
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

const onChecklistValueChanged = () => {
    store.dispatch.card.markChecklistItem(item.value);
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