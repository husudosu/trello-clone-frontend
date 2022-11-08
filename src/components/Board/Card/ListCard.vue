<template>
    <div class="listCard" @click="onCardClick" :data-id="props.card.id">
        <template v-if="!editMode">
            <div class="title">
                <li style="width: 100%; margin-bottom: 2px;">
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
                <div class="cardEditButton">
                    <q-btn size="xs" dense color="blue-grey-6" @click="onEditClick">
                        <q-icon name="edit"></q-icon>
                    </q-btn>
                </div>
            </div>
        </template>
        <template v-else>
            <q-input v-model="cardUpdate.title" type="textarea" label="Card title" autofocus autogrow
                @keyup.enter="onCardTitleKeyUp" @keyup.escape="onCancelClicked">
            </q-input>
            <q-btn class="q-ml-xs q-mr-xs q-mt-sm" size="sm" color="primary" :disable="cardUpdate.title.length === 0"
                @click="saveCard">
                Save
            </q-btn>
            <q-btn class="q-mt-sm q-mr-xs" size="sm" outline @click="onCancelClicked">Cancel</q-btn>
            <q-btn class="q-mt-sm" size="sm" flat @click="onDeleteCardClicked" dense>
                <q-icon name="delete"></q-icon>
            </q-btn>
        </template>
    </div>
</template>

<script lang="ts" setup>
import { Card, CardDate } from '@/api/types';
import { defineProps, ref } from 'vue';
import { useQuasar } from 'quasar';
import store from "@/store";
import UserAvatar from '@/components/UserAvatar.vue';
import CardDateChip from './Status/CardDateChip.vue';
import { CardAPI } from '@/api/card';

interface Props {
    card: Card;
    boardListId: number; // FIXME: We don't use this here!
}

const $q = useQuasar();
const props = defineProps<Props>();
const cardUpdate = ref();
const editMode = ref(false);

const onCardClick = () => {
    // Launch card details only if editMode inactive!
    /* FIXME: Hacky way to prevent card click event after move. 
     The issue only appears when you move card inside a list
    If you move one list to other it's not an isssued
    */
    if (!editMode.value && !store.state.card.cardMoved) {
        store.dispatch.card.loadCard(props.card.id).then(() => {
            store.commit.card.setVisible(true);
            store.dispatch.card.loadCardActivities();
        });
    }
};

const onCancelClicked = (ev: any) => {
    ev.stopPropagation();
    editMode.value = false;
    // Revert previous title
    cardUpdate.value.title = props.card.title;
};

const saveCard = async () => {
    // store.dispatch.card.updateCard(cardUpdate.value).then(() => {
    //     editMode.value = false;
    // }).catch((err) => console.log(err));
    await CardAPI.patchCard(props.card.id, cardUpdate.value);
    editMode.value = false;
};

const onDeleteCardClicked = async () => {
    $q.dialog({
        title: "Delete card",
        cancel: true,
        persistent: true,
        message: `Delete card ${props.card.title}?`,
        ok: {
            label: "Delete",
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

const onEditClick = (ev: any) => {
    ev.stopPropagation();
    // Create structured clone of card
    cardUpdate.value = { ...props.card };
    editMode.value = true;
};

const onDateMark = (ev: any, cardDate: CardDate) => {
    ev.stopPropagation();
    cardDate.complete = !cardDate.complete;
    // store.dispatch.card.updateCardDate(cardDate);
    CardAPI.patchCardDate(cardDate.id, cardDate);
};

</script>