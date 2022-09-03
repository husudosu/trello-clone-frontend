<template>
    <li ref="cardRef" class="listCard" @click="onCardClick(card)">
        <template v-if="card.id">
            {{ card.title }}
        </template>
        <template v-else>
            <q-input v-model="card.title" type="textarea" label="Card title"
                @keyup.enter="onCardTitleKeyUp($event, card)" @blur="saveCard(card)" autofocus autogrow>
            </q-input>
            <q-btn @click="saveCard(card)" style="margin-top: 10px;" size="sm" color="primary">
                Save
            </q-btn>
        </template>
    </li>
</template>

<script lang="ts" setup>
import { Card } from '@/api/types';
import { defineProps, onMounted, ref } from 'vue';

import store from "@/store";

interface Props {
    card: Card;
    boardListId: number;
}

const props = defineProps<Props>();

const card = ref(props.card);
const cardRef = ref();

const saveCard = (card: Card) => {
    if (card.title && card.title.length > 0) {
        // Save card into db
        store.dispatch.board.saveCard({ boardListId: props.boardListId, card });
        // Remove draft state
        cardRef.value.classList.remove("draftCard");
    }
    else {
        // Remove draft card
        store.commit.board.removeCard({ boardListId: props.boardListId, card });
    }
};

const onCardTitleKeyUp = (ev: KeyboardEvent, card: Card) => {
    if (ev.ctrlKey) saveCard(card);
};

const onCardClick = (item: Card) => {
    if (item.id) {
        store.dispatch.card.loadCard(item.id).then(() => {
            store.commit.card.setVisible(true);
            store.dispatch.card.loadCardActivities();
        });
    }
};

onMounted(() => {
    // If the card draft add class
    if (!card.value.id)
        cardRef.value.classList.add("draftCard");
});
</script> 