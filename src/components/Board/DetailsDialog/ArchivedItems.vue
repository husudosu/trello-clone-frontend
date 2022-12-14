<template>
    <div class="q-pa-md">
        <q-tabs v-model="tab" dense align="justify">
            <q-tab name="cards" label="Cards"></q-tab>
            <q-tab name="lists" label="Lists"></q-tab>
        </q-tabs>

        <q-tab-panels v-model="tab">
            <q-tab-panel name="cards">
                <q-list padding bordered>
                    <q-item dense class="q-mb-md" v-for="item in archivedCards" :key="item.id">
                        <q-item-section>
                            <q-item-label>
                                {{ item.title }}
                            </q-item-label>
                            <q-item-label caption>
                                <a href="javascript:void(0);" @click="cardOnClick(item.id)">#{{ item.id }}</a> {{
        item.archived_on.format("YYYY-MM-DD HH:mm:ss")
                                }}
                            </q-item-label>
                        </q-item-section>
                    </q-item>
                </q-list>
            </q-tab-panel>
            <q-tab-panel name="lists">
                Archived lists
            </q-tab-panel>
        </q-tab-panels>
    </div>
</template>

<script lang="ts" setup>

import { BoardAPI } from "@/api/board";
import { ArchivedEntity } from "@/api/types";
import CardDetailsDialog from "@/components/CardDetailsDialog.vue";
import store from "@/store";


import { useQuasar } from 'quasar';
import { ref, onMounted } from 'vue';

const $q = useQuasar();
const tab = ref("cards");

const archivedCards = ref<ArchivedEntity[]>([]);
const archivedLists = ref<ArchivedEntity[]>([]);

const cardOnClick = (cardId: number) => {
    $q.dialog({
        component: CardDetailsDialog,
        componentProps: { cardId }
    });
};
onMounted(async () => {
    try {
        $q.loading.show({ delay: 180 });
        if (store.state.board.board) {
            archivedCards.value = await BoardAPI.getArchivedCards(store.state.board.board.id);
            archivedLists.value = await BoardAPI.getArchivedLists(store.state.board.board.id);
        }
    }
    finally {
        $q.loading.hide();
    }
})

</script>