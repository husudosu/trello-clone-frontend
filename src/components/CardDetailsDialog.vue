<template>
    <q-dialog v-model="cardModalVisible" :fullWidth="true" :fullHeight="true" v-if="card">
        <q-layout view="hHh lpR fFf" container class="bg-white">
            <q-header class="bg-primary">
                <q-toolbar>
                    <q-toolbar-title
                        @dblclick="hasPermission(BoardPermission.CARD_EDIT) ? editCardTitle = !editCardTitle : false">
                        <template v-if="!editCardTitle">
                            {{ card?.title }}
                        </template>
                        <template v-else>
                            <q-input v-model="card.title" @blur="onTitleEdit" @keydown.enter="onTitleEdit" autofocus>
                            </q-input>
                        </template>
                    </q-toolbar-title>
                    <q-btn flat @click="rightDrawerVisible = !rightDrawerVisible" round dense icon="settings" />
                    <q-btn flat v-close-popup round dense icon="close" />
                </q-toolbar>
            </q-header>
            <q-drawer side="right" v-model="rightDrawerVisible" :width="250" :breakpoint="400" class="bg-white q-pa-sm"
                show-if-above>
                <span class="text-h5">Card settings</span>
                <div class="q-pa-md q-gutter-md">
                    <q-btn align="between" class="full-width" icon="person" dense>Members</q-btn>
                    <q-btn align="between" class="full-width" icon="label" dense>Labels</q-btn>
                    <q-btn align="between" class="full-width" icon="checklist" dense
                        :disable="!hasPermission(BoardPermission.CHECKLIST_CREATE)"
                        @click="showNewChecklist = !showNewChecklist">
                        Checklist
                        <add-card-checklist :show="showNewChecklist"></add-card-checklist>
                    </q-btn>
                    <q-btn align="between" class="full-width" icon="schedule" dense>Due date</q-btn>
                    <q-btn align="between" class="full-width" icon="delete" dense @click="onDeleteClicked"
                        :disable="!hasPermission(BoardPermission.CARD_EDIT)">Delete
                    </q-btn>
                </div>
            </q-drawer>
            <q-page-container>
                <q-page padding>
                    <div class="row q-mb-sm">
                        <q-icon name="article" class="q-mr-sm text-h5" style="top: 6px;"> </q-icon>
                        <span class="text-h5">
                            <span>Description</span>
                        </span>
                    </div>
                    <div class="qa-pa-md q-list--bordered card-description"
                        @dblclick="hasPermission(BoardPermission.CARD_EDIT) ? editCardDescription = !editCardDescription : false">
                        <template v-if="!editCardDescription">
                            {{ card?.description }}
                        </template>
                        <template v-else>
                            <q-input v-model="card.description" type="textarea" @keydown.enter="onDescriptionEdit"
                                autofocus>
                            </q-input>
                        </template>
                    </div>
                    <template v-if="card.checklists.length > 0">
                        <div class="row q-mb-sm q-mt-sm">
                            <q-icon name="checklist" class="q-mr-sm text-h5" style="top: 6px;"> </q-icon>
                            <span class="text-h5">
                                <span>Checklists</span>
                            </span>
                        </div>
                        <div v-for="checklist in card.checklists" :key="checklist.id">
                            <card-checklist :checklist="checklist"></card-checklist>
                        </div>
                    </template>
                    <div class="row justify-between">
                        <div class="q-mb-sm q-mt-sm">
                            <q-icon name="view_list" class="q-mr-sm text-h5" style="top: -2px;"> </q-icon>
                            <span class="text-h5">
                                <span>Activity</span>
                            </span>
                        </div>
                        <div class="q-ml-xs q-mb-xs on-right">
                            <q-btn size="sm" style="top: 10px;">Show details</q-btn>
                        </div>
                    </div>
                    <div class="q-pa-md" style="width:100%;">
                        <q-input v-model="newComment" type="textarea" placeholder="New comment..." autofocus
                            @keydown.enter="onNewComment" :disable="!hasPermission(BoardPermission.CARD_COMMENT)" />
                    </div>
                    <div class="card-comments" v-if="!activitiesLoading">
                        <q-list padding bordered>
                            <card-activity v-for="activity in activities" :key="activity.id" :activity="activity">
                            </card-activity>
                            <div class="q-ml-sm q-mr-sm">
                                <q-btn class="full-width" unelevated outline color="primary"
                                    v-if="activityPagination && activityPagination?.page < activityPagination?.pages"
                                    @click="onLoadMoreClicked">
                                    Load more...</q-btn>
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
import { Card, BoardPermission } from "@/api/types";
import { CardAPI } from '@/api/card';
import CardActivity from './Board/Card/CardActivity.vue';
import CardChecklist from './Board/Card/CardChecklist.vue';
import AddCardChecklist from './Board/Card/AddCardChecklist.vue';

const hasPermission = store.getters.board.hasPermission;

const card = computed(() => store.state.card.card);
const activities = computed(() => store.state.card.activities);
const activityPagination = computed(() => store.state.card.activityPagination);
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
            store.commit.card.unloadCard();
        }
    }
});

const activitiesLoading = computed(() => store.state.card.activitiesLoading);
const rightDrawerVisible = ref(false);


const newComment = ref("");
const editCardDescription = ref(false);
const editCardTitle = ref(false);

const showNewChecklist = ref(false);
const onNewComment = async (e: KeyboardEvent) => {
    if (e.ctrlKey) {
        if (newComment.value !== undefined)
            store.dispatch.card.addCardComment(newComment.value).then(() => newComment.value = "");
    }
};

const onDescriptionEdit = async (e: KeyboardEvent) => {
    if (e.ctrlKey && card.value && card.value.id && card.value.description) {
        editCardDescription.value = false;
        CardAPI.patchCard(card.value.id, { description: card.value.description });
    }
};

const onTitleEdit = async () => {
    if (card.value && card.value.title && card.value.id) {
        editCardTitle.value = false;
        const updatedCard: Card = await CardAPI.patchCard(card.value.id, { title: card.value.title });
        store.commit.board.updateCard(updatedCard);
    }
};

const onDeleteClicked = () => {
    if (confirm("Delete card?")) {
        if (card.value != undefined) {
            store.dispatch.card.deleteCardFromAPI(card.value);
        }
    }
};

const onLoadMoreClicked = () => {
    if (activityPagination.value)
        store.dispatch.card.loadCardActivities({ page: activityPagination.value?.page + 1, per_page: 10 });
};
</script>

<style lang="scss">
@import "../styles/cardDetails.scss";
</style>
