<template>
    <li class="listCard draftCard">
        <q-input v-model="card.title" type="textarea" label="Card title" @keyup.enter="onCardTitleKeyUp"
            @keyup.escape="onCancelClicked" @blur="saveCard" autofocus autogrow>
        </q-input>
        <q-btn class="q-ml-xs q-mr-sm q-mt-sm" @click="saveCard" size="sm" color="primary"
            :disable="card.title.length === 0">
            Save
        </q-btn>
        <q-btn class="q-mt-sm" size="sm" outline @click="onCancelClicked">Cancel</q-btn>
    </li>
</template>

<script lang="ts" setup>
import { DraftCard } from '@/api/types';
import { defineProps, ref } from 'vue';

import store from "@/store";

interface Props {
    card: DraftCard;
    boardListId: number;
}

const props = defineProps<Props>();
const card = ref(props.card);

const saveCard = () => {
    if (card.value.title.length > 0) {
        // Save card into db
        store.dispatch.board.saveCard({ boardListId: props.boardListId, card: card.value });
    }
    else {
        // Remove draft card
        store.commit.board.removeCard({ boardListId: props.boardListId, card: card.value });
    }
};


const onCardTitleKeyUp = (ev: KeyboardEvent) => {
    if (ev.ctrlKey) saveCard();
};

const onCancelClicked = () => {
    // Remove draft card
    store.commit.board.removeCard({ boardListId: props.boardListId, card: card.value });
};

</script> 