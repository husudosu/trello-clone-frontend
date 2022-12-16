<template>
    <div class="q-pa-md">
        <q-tabs v-model="tab" dense align="justify">
            <q-tab name="cards" label="Cards"></q-tab>
            <q-tab name="lists" label="Lists"></q-tab>
        </q-tabs>

        <q-tab-panels v-model="tab">
            <q-tab-panel name="cards">
                <archived-cards-vue></archived-cards-vue>
            </q-tab-panel>
            <q-tab-panel name="lists">
                <archived-lists-vue></archived-lists-vue>
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import ArchivedCardsVue from "./ArchivedItems/ArchivedCards.vue";
import ArchivedListsVue from "./ArchivedItems/ArchivedLists.vue";
const tab = ref("cards");

</script>