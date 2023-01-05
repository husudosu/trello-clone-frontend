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
                <span v-if="props.item.due_date" class="q-mr-sm q-mt-xs">
                    {{ props.item.due_date?.format("YYYY-MM-DD HH:mm") }}
                </span>
                <user-avatar v-if="props.item.assigned_user" size="sm" :user="props.item.assigned_user.user"
                    :show-delete="true" @delete="onDeassignMember" :show-tooltip="false">
                </user-avatar>
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
import { ChecklistItem, BoardPermission, BoardAllowedUser } from "@/api/types";
import { useQuasar } from 'quasar';
import AssignMember from "@/components/Board/Card/AssignMember.vue";
import UserAvatar from '@/components/UserAvatar.vue';
import DateToItemDialog from './DateToItemDialog.vue';
import { ChecklistAPI } from '@/api/checklist';
import { useBoardStore } from '@/stores/board';

const boardStore = useBoardStore();
const hasPermission = boardStore.hasPermission;

const $q = useQuasar();

interface Props {
    item: ChecklistItem;
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

const onAssignMember = () => {
    $q.dialog({
        component: AssignMember,
        componentProps: {
            showOnlyNotAssignedMembers: false
        }
    }
    ).onOk((data: BoardAllowedUser) => {
        ChecklistAPI.assignMemberToChecklistItem(props.item.id, data);
    });
};

const onDeassignMember = () => {
    ChecklistAPI.deassignMemberToChecklistItem(props.item.id);
};

const onAssignDueDate = () => {
    $q.dialog({
        component: DateToItemDialog,
    }).onOk((data) => {
        ChecklistAPI.patchChecklistItem(props.item.id, { due_date: data });
    });
};
</script>