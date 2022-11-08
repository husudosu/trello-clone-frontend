<template>
    <li class="listCard draftCard">
        <q-input v-model="card.title" type="textarea" label="Card title" @keyup.enter="onCardTitleKeyUp"
            @keyup.escape="props.onCancel" @blur="saveCard" autofocus autogrow>
        </q-input>
        <q-btn class="q-ml-xs q-mr-sm q-mt-sm" @click="saveCard" size="sm" color="primary"
            :disable="card.title.length === 0">
            Save
        </q-btn>
        <q-btn class="q-mt-sm draftCardCancelButton" size="sm" outline @click="props.onCancel">Cancel</q-btn>
    </li>
</template>

<script lang="ts" setup>
import { DraftCard } from '@/api/types';
import { defineProps, ref } from 'vue';

import { CardAPI } from '@/api/card';

type OnCancel = () => void;
type OnSaveSuccess = () => void;
interface Props {
    boardListId: number;
    onCancel: OnCancel;
    onSaveSuccess: OnSaveSuccess;
}

const props = defineProps<Props>();
const card = ref<DraftCard>({ list_id: props.boardListId, title: "" });

const saveCard = async (ev: any) => {
    // FIXME: this seems hacky. If the related target contains draftCardCancelButton class we don't save data.
    let relatedTargetClasses = [];
    if (ev.relatedTarget)
        relatedTargetClasses = ev.relatedTarget.getAttribute("class").split(" ");

    if (!relatedTargetClasses.includes("draftCardCancelButton") && card.value.title.length > 0) {
        // Save card into db
        // store.dispatch.board.saveCard(card.value);
        await CardAPI.postCard(card.value.list_id, card.value);
        props.onSaveSuccess();
    }
    else {
        props.onCancel();
    }
};


const onCardTitleKeyUp = (ev: KeyboardEvent) => {
    if (ev.ctrlKey) saveCard(ev);
};


</script> 