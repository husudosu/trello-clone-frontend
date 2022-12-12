<template>
    <div class="q-pa-md activityContainer">
        <q-infinite-scroll @load="onLoad" :offset="250">
            <q-list bordered>
                <template v-if="activities && activities.data.length > 0">
                    <card-activity-vue v-for="activity in activities.data" :activity="activity" :key="activity.id"
                        :show-card-title="true">
                    </card-activity-vue>
                </template>
                <template v-else>
                    <span class="q-ma-sm">
                        No activity yet
                    </span>
                </template>
            </q-list>
            <template v-slot:loading>
                <div class="row justify-center q-my-md">
                    <q-spinner-dots color="primary" size="40px" />
                </div>
            </template>
        </q-infinite-scroll>
    </div>
</template>


<script lang="ts" setup>
import { ref } from 'vue';
import { PaginatedCardActivity } from '@/api/types';
import { BoardAPI } from '@/api/board';
import CardActivityVue from '../Card/CardActivity.vue';
import store from '@/store';

const activities = ref<PaginatedCardActivity>();

const onLoad = async (index: number, done: any) => {
    if (store.state.board.board) {
        if (!activities.value) {
            activities.value = await BoardAPI.getBoardActivities(store.state.board.board.id, { page: index, per_page: 30 });
            done();
        }
        else if (index <= activities.value?.pages) {
            const data = await BoardAPI.getBoardActivities(store.state.board.board.id, { page: index, per_page: 30 });
            activities.value.links = data.links;
            activities.value.page = data.page;
            activities.value.pages = data.pages;
            activities.value.per_page = data.per_page;
            activities.value.total = data.total;
            activities.value.data.push(...data.data);
            done();
        }
        else {
            done(true);
        }
    }
};
</script> 
<style  lang="scss" >
$toolbar_height: 200px;

.activityContainer {
    height: calc(100vh - #{$toolbar_height});
}
</style>