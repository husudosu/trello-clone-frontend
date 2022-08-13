<template>
    <q-dialog v-model="cardModalVisible" :fullWidth="true" :fullHeight="true">
        <q-layout view="hHh lpR fFf" container class="bg-white">
            <q-header class="bg-primary">
                <q-toolbar>
                    <q-toolbar-title>{{ card?.title }}</q-toolbar-title>
                    <q-btn flat @click="rightDrawerVisible = !rightDrawerVisible" round dense icon="settings" />
                    <q-btn flat v-close-popup round dense icon="close" />
                </q-toolbar>
            </q-header>
            <q-drawer side="right" v-model="rightDrawerVisible" :width="250" :breakpoint="400" class="bg-white q-pa-sm"
                show-if-above>
                <span class="text-h6">Card settings</span>
                <div class="q-pa-md q-gutter-md">

                    <q-btn align="between" class="full-width" icon="person" dense>Members</q-btn>
                    <q-btn align="between" class="full-width" icon="label" dense>Labels</q-btn>
                    <q-btn align="between" class="full-width" icon="checklist" dense>Checklist</q-btn>
                    <q-btn align="between" class="full-width" icon="schedule" dense>Due date</q-btn>
                    <q-btn align="between" class="full-width" icon="delete" dense @click="onDeleteClicked">Delete
                    </q-btn>
                </div>
            </q-drawer>
            <q-page-container>
                <q-page padding>
                    <span class="text-h6">Description</span>
                    <div class="qa-pa-md q-list--bordered card-description"
                        @dblclick="editCardDescription = !editCardDescription">
                        <template v-if="!editCardDescription">
                            {{ card?.description }}
                        </template>
                        <template v-else>
                            <q-input v-model="card.description" type="textarea" @keydown.enter="onDescriptionEdit"
                                autofocus>
                            </q-input>
                        </template>
                    </div>

                    <span class="text-h6">Activity</span>
                    <div class="card-comments" v-if="!activitiesLoading">
                        <q-list padding bordered>
                            <div v-for="activity in card?.activities" :key="activity.id">
                                <q-item>
                                    <q-item-section top avatar>
                                        <q-avatar rounded>
                                            <img src="@/assets/avatar-placeholder.png" />
                                        </q-avatar>
                                    </q-item-section>

                                    <q-item-section>
                                        <q-item-label>{{ activity?.user?.name }} ({{ activity?.user?.username }})
                                        </q-item-label>
                                        <q-item-label caption>

                                            <template v-if="activity?.event == CardActivityEvent.CARD_COMMENT">
                                                <span style="white-space: pre-wrap;">{{ activity?.comment?.comment
                                                }}</span>
                                            </template>
                                            <template
                                                v-else-if="activity?.event == CardActivityEvent.CARD_MOVE_TO_LIST">Moved
                                                from
                                                <b>{{ activity.list_change?.from_list?.title || "N/A" }} </b> to
                                                <b>{{
                                                        activity.list_change?.to_list?.title || "N/A"
                                                }}</b>
                                            </template>
                                        </q-item-label>
                                    </q-item-section>

                                    <q-item-section side top>
                                        <q-item-label caption>{{ activity.activity_on || `Updated
                                                                                    (${activity?.comment?.updated})`
                                        }}
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                                <q-separator spaced inset="item" />
                            </div>
                            <div class="q-pa-md" style="width:100%;">
                                <q-input v-model="newComment" type="textarea" placeholder="New comment..." autofocus
                                    @keydown.enter="onNewComment" />
                            </div>
                        </q-list>
                    </div>
                    <div v-else>
                        <q-spinner-comment size="5em" />
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </q-dialog>

</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import store from "@/store";
import { CardActivityEvent } from "@/api/types";
import { patchCard } from '@/api/card';

const card = computed(() => store.state.card.card);
const cardModalVisible = computed({
    get() {
        return store.state.card.visible;
    },
    set(newValue) {
        store.commit.card.setVisible(newValue);
        // clear fields
        if (!newValue) {
            editCardDescription.value = false;
            newComment.value = "";
        }
    }
});

const activitiesLoading = computed(() => store.state.card.activitiesLoading);
const rightDrawerVisible = ref(false);


const newComment = ref("");
const editCardDescription = ref(false);


const onNewComment = async (e: any) => {
    if (e.ctrlKey) {
        if (newComment.value !== undefined)
            store.dispatch.card.addCardComment(newComment.value).then(() => newComment.value = "");
    }
};

const onDescriptionEdit = async (e: any) => {
    if (e.ctrlKey && card.value && card.value.id && card.value.description) {
        editCardDescription.value = false;
        patchCard(card.value.id, { description: card.value.description });
    }
};

const onDeleteClicked = () => {
    console.log("Delete");
    if (confirm("Are you sure about deleting card?")) {
        if (card.value != undefined) {
            store.dispatch.card.deleteCardFromAPI(card.value);
        }
    }
};



</script>

<style lang="scss">
@import "../styles/cardDetails.scss";
</style>
