<template>
    <div class="row q-mb-sm">
        <q-icon name="schedule" class="q-mr-sm text-h5" style="top: 6px;"> </q-icon>
        <span class="text-h5">
            <span>Dates</span>
        </span>
    </div>
    <q-list>
        <q-item v-for="dt in card?.dates" :key="dt.id" dense style="padding-left: 0px;">
            <q-item-section avatar top>
                <q-checkbox v-model="dt.complete" size="sm" @update:model-value="onDateMark(dt)"></q-checkbox>
            </q-item-section>
            <q-item-section @click="onDateEditClicked(dt)">
                <q-item-label :class="{ checklistItemDone: dt.complete }">
                    <b>{{ dt.description }}</b>
                    {{ dt.dt_from ? dt.dt_from.format("YYYY-MM-DD HH:mm") + ' - ' : '' }}
                    {{ dt.dt_to.format("YYYY-MM-DD HH:mm") }}
                </q-item-label>
            </q-item-section>
            <q-item-section side>
                <q-btn v-if="hasPermission(BoardPermission.CARD_EDIT_DATE)" flat size="sm" dense class="q-ml-xs"
                    @click="onDateDelete(dt)">
                    <q-icon name="delete"></q-icon>
                </q-btn>
            </q-item-section>
        </q-item>
    </q-list>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { CardDate, BoardPermission } from '@/api/types';

import { useQuasar } from "quasar";
import CardDateDialog from "../CardDateDialog.vue";
import { CardAPI } from "@/api/card";
import { useBoardStore } from "@/stores/board";
import { useCardStore } from "@/stores/card";

const boardStore = useBoardStore();
const cardStore = useCardStore();
const hasPermission = boardStore.hasPermission;
const card = computed(() => cardStore.card);

const $q = useQuasar();

const onDateMark = async (cardDate: CardDate) => {
    CardAPI.patchCardDate(cardDate.id, { complete: cardDate.complete });
};

const onDateDelete = async (cardDate: CardDate) => {
    CardAPI.deleteCardDate(cardDate.id);
};

const onDateEditClicked = async (cardDate: CardDate) => {
    $q.dialog({
        component: CardDateDialog,
        componentProps: { cardDate }
    }).onOk((data: CardDate) => {
        CardAPI.patchCardDate(cardDate.id, data);
    });
};
</script>