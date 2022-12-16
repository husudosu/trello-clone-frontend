<template>

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
                    On <b>{{ item.board_list.title }}</b> list {{ !item.board_list.archived ? "" :
                            "(Archived)"
                    }}
                </q-item-label>
            </q-item-section>
        </q-item>
        <q-item dense class="q-mb-md" v-if="archivedCards.length == 0">
            <q-item-section>
                <q-item-label>
                    No archived cards yet.
                </q-item-label>
            </q-item-section>
        </q-item>
    </q-list>

</template>

<script lang="ts" setup>

import { BoardAPI } from "@/api/board";
import { ArchivedCard } from "@/api/types";
import CardDetailsDialog from "@/components/CardDetailsDialog.vue";
import store from "@/store";

import { useQuasar } from 'quasar';
import { ref, onMounted } from 'vue';

const $q = useQuasar();

const archivedCards = ref<ArchivedCard[]>([]);

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
        }
    }
    finally {
        $q.loading.hide();
    }
})

</script>