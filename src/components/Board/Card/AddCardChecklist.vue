<template>
    <q-menu v-model="show" ref="menu" style="min-width: 270px">
        <span class="text-h6">New checklist</span>
        <q-form class="q-pa-sm" ref="form" @submit.prevent.stop="onCreateChecklist">
            <q-input v-model="checklistTitle" label="Title" dense autofocus></q-input>
            <q-btn color="primary" class="q-mt-sm q-mb-sm" type="submit">Add</q-btn>
        </q-form>
    </q-menu>
</template>

<script lang="ts" setup>
import { ref, defineProps, nextTick } from 'vue';
import store from "@/store/index";

const form = ref();
const checklistTitle = ref("");

interface Props {
    show: boolean;
}

const props = defineProps<Props>();
const menu = ref();
const show = ref(props.show);

const onCreateChecklist = async () => {
    await store.dispatch.card.addCardChecklist({ title: checklistTitle.value });
    menu.value.hide();
    nextTick(() => {
        checklistTitle.value = "";
    });
};
</script> 