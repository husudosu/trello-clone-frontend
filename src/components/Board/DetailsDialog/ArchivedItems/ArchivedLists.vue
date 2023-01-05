<template>
    <q-list padding bordered>
        <q-item dense class="q-mb-md" v-for="item in archivedLists" :key="item.id">
            <q-item-section>
                <q-item-label>
                    <div class="row justify-between">
                        {{ item.title }}
                        <div>
                            <q-btn flat size="sm" dense color="primary" @click="onRevertListClick(item.id)"
                                class="q-mr-md">Revert</q-btn>
                            <q-btn flat size="sm" dense color="red" @click="onDeleteListClick(item)">Delete</q-btn>
                        </div>
                    </div>
                </q-item-label>
                <q-item-label caption>
                    #{{ item.id }} {{
                        item.archived_on.format("YYYY-MM-DD HH:mm:ss")
                    }}
                    <p v-if="item.cards.length > 0">
                        <b>Cards on list:</b>
                    <ul>
                        <li v-for="card in item.cards" :key="card.id">
                            <a href="javascript:void(0);" @click="cardOnClick(card.id)">#{{ card.id }}</a> {{
                                card.title
                            }}
                        </li>
                    </ul>
                    </p>
                </q-item-label>

            </q-item-section>
        </q-item>
        <q-item dense class="q-mb-md" v-if="archivedLists.length == 0">
            <q-item-section>
                <q-item-label>
                    No archived lists yet.
                </q-item-label>
            </q-item-section>
        </q-item>

    </q-list>

</template>

<script lang="ts" setup>

import { BoardListAPI } from "@/api/boardList";
import { ArchivedList } from "@/api/types";
import { useArchiveStore } from "@/stores/archive";
import CardDetailsDialog from "@/components/CardDetailsDialog.vue";

import { useQuasar } from 'quasar';
import { onMounted, computed } from 'vue';
import { useBoardStore } from "@/stores/board";

const $q = useQuasar();
const boardStore = useBoardStore();
const archiveStore = useArchiveStore();
const archivedLists = computed(() => archiveStore.lists);

const cardOnClick = (cardId: number) => {
    $q.dialog({
        component: CardDetailsDialog,
        componentProps: { cardId }
    });
};

const onRevertListClick = async (listId: number) => {
    await BoardListAPI.patchBoardList(listId, { archived: false });
};

const onDeleteListClick = (list: ArchivedList) => {
    $q.dialog({
        title: "Delete card",
        cancel: true,
        ok: {
            label: "Delete",
            color: "negative"
        },
        persistent: true,
        message: `This gonna PERMANENTLY delete ${list.title} (including all the cards assigned to list), are you sure?`
    }).onOk(() => {
        BoardListAPI.deleteBoardList(list.id);
    });

};

onMounted(async () => {
    try {
        $q.loading.show({ delay: 180 });
        if (boardStore.board)
            await archiveStore.loadArchivedLists(boardStore.board.id);
    }
    finally {
        $q.loading.hide();
    }
})

</script>