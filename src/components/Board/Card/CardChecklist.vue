<template>
    <div>
        <span class="text-h6">{{ checklist.title }}</span>
        <div>
            <q-checkbox size="sm" v-for="item in checklist.items" :key="item.id" v-model="item.completed"
                @update:model-value="onChecklistValueChanged(item)" :label="item.title">
            </q-checkbox>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { defineProps, ref } from 'vue';
import { CardChecklist, ChecklistItem } from "@/api/types";
import { ChecklistAPI } from "@/api/checklist";

interface Props {
    checklist: CardChecklist;
}

const props = defineProps<Props>();
const checklist = ref(props.checklist);

const onChecklistValueChanged = async (item: ChecklistItem) => {
    await ChecklistAPI.markChecklistItem(item.id, item.completed);
};
</script>
