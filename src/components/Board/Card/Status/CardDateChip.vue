<template>
    <q-chip :color="chipColor" icon="schedule" size="md" text-color="white" class="non-selectable" dense clickable>
        <template v-if="!props.cardDate.dt_from">
            {{ props.cardDate.dt_to.format('MMM DD') }}
        </template>
        <template v-else>
            {{ props.cardDate.dt_from.format('MMM DD') }} - {{ props.cardDate.dt_to.format('MMM DD') }}
        </template>
        <q-tooltip>
            <template v-if="props.cardDate.dt_from">
                <b>From:</b> {{ props.cardDate.dt_from.format("YYYY-MM-DD HH:mm:ss") }}
                <br />
            </template>
            <b>To:</b> {{ props.cardDate.dt_to.format("YYYY-MM-DD HH:mm:ss") }}
            <br />
            {{ props.cardDate.description }}
        </q-tooltip>
    </q-chip>
</template>

<script lang="ts" setup>
import { defineProps, computed } from "vue";
import { CardDate } from "@/api/types";

interface Props {
    cardDate: CardDate;
}

const props = defineProps<Props>();
const isLate = props.cardDate.dt_to.isBefore(new Date());

const chipColor = computed(() => props.cardDate.complete ? 'green' : (isLate ? 'red' : 'orange'))
/*
    Chip colors:
        - green: complete,
        - red: not complete, overdue,
        - orange: not complete, before due date
*/
</script>