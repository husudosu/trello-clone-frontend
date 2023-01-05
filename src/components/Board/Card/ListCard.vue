<template>
    <div ref="listCardRef" class="listCard non-selectable" @click="onCardClick" :data-id="props.card.id">
        <template v-if="!editMode">
            <div class="title">
                <li>
                    {{ props.card.title }}
                </li>
                <div class="row q-mb-xs q-mt-sm" v-if="props.card.assigned_members.length > 0">
                    <user-avatar v-for="member in props.card.assigned_members" :key="member.id" class="q-mr-xs"
                        size="sm" :user="member.board_user.user">
                    </user-avatar>
                </div>
                <div class="row q-mb-xs q-mt-sm" v-if="props.card.dates.length > 0">
                    <card-date-chip v-for="dt in props.card.dates" :key="dt.id" class="q-mr-xs" :card-date="dt"
                        @click="onDateMark($event, dt)">
                    </card-date-chip>
                </div>
                <div class="row q-mb-xs q-mt-sm" v-if="props.card.checklists.length > 0">
                    <checklist-status v-for="checklist in props.card.checklists" :key="checklist.id" class="q-mr-xs"
                        :checklist="checklist"></checklist-status>
                </div>
                <div class="cardEditButton">
                    <q-btn size="xs" dense color="blue-grey-6" @click="onEditClick">
                        <q-icon name="edit"></q-icon>
                    </q-btn>
                </div>
            </div>
        </template>
        <template v-else>
            <q-input v-model="newTitle" type="textarea" label="Card title" autofocus autogrow
                @keyup.enter="onCardTitleKeyUp" @keyup.escape="onCancelClicked">
            </q-input>
            <q-btn class="q-ml-xs q-mr-xs q-mt-sm" size="sm" color="primary" :disable="newTitle.length === 0"
                @click="saveCard">
                Save
            </q-btn>
            <q-btn class="q-mt-sm q-mr-xs" size="sm" outline @click="onCancelClicked">Cancel</q-btn>
            <q-btn class="q-mt-sm" size="sm" flat @click="onArchiveCardClicked" dense>
                <q-icon name="archive"></q-icon>
            </q-btn>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { Card, CardDate } from '@/api/types';
import { defineProps, ref } from 'vue';
import { useQuasar } from 'quasar';
import UserAvatar from '@/components/UserAvatar.vue';
import CardDateChip from './Status/CardDateChip.vue';
import { CardAPI } from '@/api/card';

import CardDetailsDialog from "@/components/CardDetailsDialog.vue";
import ChecklistStatus from './Status/ChecklistStatus.vue';
import { useCardStore } from '@/stores/card';

const $q = useQuasar();
const props = defineProps<{ card: Card; }>();
const editMode = ref(false);
const listCardRef = ref();
const newTitle = ref("");

const cardStore = useCardStore();

const onCardClick = () => {
    // Launch card details only if editMode inactive!
    /* FIXME: Hacky way to prevent card click event after move. 
     The issue only appears when you move card inside a list
    If you move one list to other it's not an isssued
    */
    if (!editMode.value && !cardStore.cardMoved) {
        $q.dialog({
            component: CardDetailsDialog,
            componentProps: { cardId: props.card.id }
        });
    }
};

const onCancelClicked = (ev: Event) => {
    ev.stopPropagation();
    editMode.value = false;
    // Revert previous title
    newTitle.value = props.card.title;
    listCardRef.value.classList.remove("draftCard");
};

const saveCard = async () => {
    await CardAPI.patchCard(props.card.id, { title: newTitle.value });
    editMode.value = false;
    listCardRef.value.classList.remove("draftCard");
};

const onArchiveCardClicked = async () => {
    $q.dialog({
        title: "Archive card",
        cancel: true,
        persistent: true,
        message: `Archive card ${props.card.title}?`,
        ok: {
            label: "Archive",
            color: "negative"
        }
    }).onOk(() => {
        // store.dispatch.card.deleteCardFromAPI(props.card);
        CardAPI.deleteCard(props.card.id);
    });
};

const onCardTitleKeyUp = (ev: KeyboardEvent) => {
    if (ev.ctrlKey) saveCard();
};

const onEditClick = (ev: Event) => {
    ev.stopPropagation();
    // Create structured clone of card
    listCardRef.value.classList.add("draftCard");
    newTitle.value = props.card.title;
    editMode.value = true;

};

const onDateMark = (ev: Event, cardDate: CardDate) => {
    ev.stopPropagation();
    CardAPI.patchCardDate(cardDate.id, { complete: !cardDate.complete });
};

</script>