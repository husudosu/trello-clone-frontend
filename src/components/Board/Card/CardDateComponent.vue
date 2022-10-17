<template>
    <q-chip :color="props.cardDate.complete ? 'green' : (isLate ? 'red' : 'orange')" icon="schedule" size="md"
        text-color="white" class="noSelectText" dense clickable>
        {{ props.cardDate.dt_to.format('MMM DD')}}
        <q-tooltip>
            {{ props.cardDate.dt_to.format("YYYY-MM-DD HH:mm:ss")}}
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


/*
    green: complete,
    red: not complete, overdue,
    orange: not complete, before due date
*/
const chipColor = props.cardDate.complete ? "green" : (isLate ? "red" : "orange");
</script>

<style>
.noSelectText {
    -webkit-touch-callout: none;
    /* iOS Safari */
    -webkit-user-select: none;
    /* Safari */
    -khtml-user-select: none;
    /* Konqueror HTML */
    -moz-user-select: none;
    /* Old versions of Firefox */
    -ms-user-select: none;
    /* Internet Explorer/Edge */
    user-select: none;
    /* Non-prefixed version, currently supported by Chrome, Edge, Opera and Firefox */
}
</style>