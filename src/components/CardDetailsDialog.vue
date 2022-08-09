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
                </div>
            </q-drawer>
            <q-page-container>
                <q-page padding>
                    <span class="text-h6">Description</span>
                    <div class="qa-pa-md q-list--bordered card-description">
                        {{ card?.description }}
                    </div>

                    <span class="text-h6">Activity</span>
                    <div class="card-comments">
                        <q-list padding bordered>
                            <div v-for="activity in card?.activities" :key="activity.id">
                                <q-item>
                                    <q-item-section top avatar>
                                        <q-avatar rounded>
                                            <img :src="activity?.user?.avatar_url" />
                                        </q-avatar>
                                    </q-item-section>

                                    <q-item-section>
                                        <q-item-label>{{ activity?.user?.name }}</q-item-label>
                                        <q-item-label caption>
                                            {{ activity?.comment?.comment }}
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
                                <q-input v-model="newComment.comment" type="textarea" placeholder="New comment..." />
                                <q-btn @click="onNewComment">Save</q-btn>
                            </div>
                        </q-list>
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </q-dialog>

</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import store from "@/store";
import { CardComment } from "@/api/types";

const card = computed(() => store.state.card.card);
const cardModalVisible = computed({
    get() {
        return store.state.card.visible;
    },
    set(newValue) {
        store.commit.card.setVisible(newValue);
    }
});
const rightDrawerVisible = ref(false);

const newComment = ref<Partial<CardComment>>({ comment: undefined });

const onNewComment = async () => {
    console.log("New comment");
    if (newComment.value !== undefined)
        store.dispatch.card.addCardComment(newComment.value).then(() => newComment.value.comment = undefined);

};

</script>

<style lang="scss">
@import "../styles/cardDetails.scss";
</style>
