<template>
    <q-chip class="non-selectable" icon="checklist" size="md" dense
        :color="completedItemsCount === checklist.items.length ? 'green' : 'orange'" text-color="white" square>
        {{ completedItemsCount }}/{{ props.checklist.items.length }}

        <q-tooltip v-if="checklist.title">
            {{ checklist.title }}
        </q-tooltip>
    </q-chip>
</template>


<script lang="ts" setup>
import { ICardChecklist } from '@/api/types';
import { defineProps, computed } from 'vue';

const props = defineProps<{
    checklist: ICardChecklist;
}>();
const completedItemsCount = computed(() => props.checklist.items.filter((el) => el.completed).length)

</script>