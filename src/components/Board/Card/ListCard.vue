<template>
    <div class="listCard" @click="onCardClick">
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
import { Card } from '@/api/types';
import { defineProps, ref } from 'vue';
import store from "@/store";
import UserAvatar from '@/components/UserAvatar.vue';

interface Props {
    card: Card;
    boardListId: number;
}

const props = defineProps<Props>();

const card = ref(props.card);
const cardUpdate = ref(structuredClone(card.value));

const editMode = ref(false);

const onCardClick = () => {
    // Launch card details only if editMode inactive!
    if (!editMode.value) {
        store.dispatch.card.loadCard(card.value.id).then(() => {
            store.commit.card.setVisible(true);
            store.dispatch.card.loadCardActivities();
        });
    }
};

const onCancelClicked = (ev: any) => {
    ev.stopPropagation();
    editMode.value = false;
    // Revert previous title
    cardUpdate.value.title = card.value.title;
};

const saveCard = async () => {
    store.dispatch.card.updateCard(cardUpdate.value).then(() => {
        editMode.value = false;
    }).catch((err) => console.log(err));
};

const onDeleteCardClicked = async () => {
    if (confirm("Delete card?")) {
        store.dispatch.card.deleteCardFromAPI(card.value);
    }
};

const onCardTitleKeyUp = (ev: KeyboardEvent) => {
    if (ev.ctrlKey) saveCard();
};

const onEditClick = (ev: any) => {
    ev.stopPropagation();
    editMode.value = true;
};
</script> 