<template>
    <q-card class="item" @click="onClick">
        <template v-if="card.id">
            {{ props.card.title }}
        </template>
        <template v-else>
            <q-input type="textarea" v-model="card.title" v-on:keyup.enter="onSave($event, card)" borderless autogrow
                dense>
            </q-input>
        </template>
    </q-card>

</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { Card } from '@/api/types';

type OnSave = (ev: any, card: Card) => void;

interface Props {
    card: Card;
    onSave: OnSave;
}

const props = defineProps<Props>();
const card = ref(props.card);

const onClick = () => {
    console.log("On Click");
};


</script>

<style>
.item {
    margin: 5px;
    padding: 5px;

    /* Disabling  text selection for cards */
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