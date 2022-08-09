<template>
    <q-dialog v-model="visible">
        <q-card>
            <q-card-section>
                fsdjfjsdf
            </q-card-section>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";

interface Props {
    visible: boolean;
}

const props = defineProps<Props>();

const visible = ref(props.visible);
</script>