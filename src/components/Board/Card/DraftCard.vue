<template>
    <li class="listCard draftCard">
        <q-input v-model="cardTitle" type="textarea" label="Card title" @keyup.enter="onCardTitleKeyUp"
            @keyup.escape="$emit('cancel')" @blur="saveCard" autofocus autogrow>
        </q-input>
        <q-btn class="q-ml-xs q-mr-sm q-mt-sm" @click="saveCard" size="sm" color="primary"
            :disable="cardTitle.length === 0">
            Save
        </q-btn>
        <q-btn class="q-mt-sm draftCardCancelButton" size="sm" outline @click="$emit('cancel')">Cancel</q-btn>
    </li>
</template>

<script lang="ts" setup>
import { defineEmits, ref } from 'vue';

const emit = defineEmits(["save", "cancel"]);
const cardTitle = ref("");

const saveCard = async (ev: any) => {
    // FIXME: this seems hacky. If the related target contains draftCardCancelButton class we don't save data.
    let relatedTargetClasses = [];
    if (ev.relatedTarget)
        relatedTargetClasses = ev.relatedTarget.getAttribute("class").split(" ");

    if (!relatedTargetClasses.includes("draftCardCancelButton") && cardTitle.value.length > 0) {
        emit("save", { title: cardTitle.value });
    }
    else {
        emit("cancel");
    }
};


const onCardTitleKeyUp = (ev: KeyboardEvent) => {
    if (ev.ctrlKey) saveCard(ev);
};


</script> 