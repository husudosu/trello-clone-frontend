<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide" icon :maximized="$q.screen.xs" full-width>
        <q-card class="q-dialog-plugin">
            <q-toolbar class="bg-secondary text-white">
                <q-toolbar-title>History</q-toolbar-title>
                <q-btn flat dense @click="onDialogCancel">
                    <q-icon name="close"></q-icon>
                </q-btn>
            </q-toolbar>
            <q-card-section>
                <div class="row q-gutter-lg">
                    <div class="col">
                        <q-input :model-value="fromDate" mask="####-##-## ##:##" :rules="[validateDateTime]"
                            label="From" fill-mask dense @update:model-value="onFromDateChange" :debounce="500">
                            <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date :model-value="fromDate" @update:model-value="onFromDateChange"
                                            mask="YYYY-MM-DD HH:mm">
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Close" color="primary" flat />
                                            </div>
                                        </q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                            <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-time :model-value="fromDate" @update:model-value="onFromDateChange"
                                            mask="YYYY-MM-DD HH:mm" format24h>
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Close" color="primary" flat />
                                            </div>
                                        </q-time>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>
                    </div>
                    <div class="col">
                        <q-input :model-value="toDate" @update:model-value="onToDateChange" mask="####-##-## ##:##"
                            :rules="[validateDateTime]" label="To" fill-mask dense :debounce="500">
                            <template v-slot:prepend>
                                <q-icon name="event" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-date :model-value="toDate" @update:model-value="onToDateChange"
                                            mask="YYYY-MM-DD HH:mm">
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Close" color="primary" flat />
                                            </div>
                                        </q-date>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                            <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                        <q-time model-value="toDate" @update:model-value="onToDateChange"
                                            mask="YYYY-MM-DD HH:mm" format24h>
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Close" color="primary" flat />
                                            </div>
                                        </q-time>
                                    </q-popup-proxy>
                                </q-icon>
                            </template>
                        </q-input>
                    </div>
                </div>
                <div class="card-comments">
                    <q-list padding bordered>
                        <template v-if="activities && activities.data.length > 0">
                            <card-activity-vue v-for="activity in activities.data" :activity="activity"
                                :key="activity.id">
                            </card-activity-vue>
                        </template>
                        <template v-else>
                            <span class="q-ma-sm">
                                No activity yet
                            </span>
                        </template>
                    </q-list>
                </div>
            </q-card-section>
            <q-card-actions>
                <q-pagination ref="qpagination" v-if="activities" v-model="activities.page" :max="activities.pages"
                    direction-links @update:model-value="loadMore" class="q-pl-sm q-pt-md q-pb-md">
                </q-pagination>

            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref, onMounted } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import moment from "moment-timezone";
import { validateDateTime } from "@/formValidators";
import { ICardActivityQueryParams, IPaginatedCardActivity } from '@/api/types';
import CardActivityVue from './CardActivity.vue';
import { CardAPI } from '@/api/card';

interface Props {
    cardId: number;
}
const $q = useQuasar();
const qpagination = ref();
const props = defineProps<Props>();

const fromDate = ref();
const toDate = ref();
const activities = ref<IPaginatedCardActivity>();
const params = ref<ICardActivityQueryParams>({
    per_page: 15,
    type: "all"
});

defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogCancel } = useDialogPluginComponent();

const loadMore = async (value: number) => {
    try {
        $q.loading.show({ delay: 180 });
        activities.value = await CardAPI.getCardActivities(props.cardId, { ...params.value, page: value });
    }
    finally {
        $q.loading.hide();
    }
};

const onFromDateChange = async (value: string) => {
    fromDate.value = value;
    params.value.dt_from = value;
    qpagination.value.set(1);
    loadMore(1);
};

const onToDateChange = async (value: string) => {
    toDate.value = value;
    params.value.dt_to = value;
    qpagination.value.set(1);
    loadMore(1);

};

onMounted(async () => {
    fromDate.value = moment().subtract(1, "weeks").hours(0).minutes(0).format("YYYY-MM-DD HH:mm");
    toDate.value = moment().hours(23).minutes(59).format("YYYY-MM-DD HH:mm");
    params.value.dt_from = fromDate.value;
    params.value.dt_to = toDate.value;
    await loadMore(1);
});
</script>