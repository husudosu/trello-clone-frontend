<template>
    <q-dialog @hide="onDialogHide" ref="dialogRef" persistent>
        <q-card style="width: 400px;">
            <q-card-section>
                <q-color :defaultValue="props.defaultColor" format-model="rgba" v-model="selectedColor" flat noHeaderTabs
                    style="max-width: 100% !important" />
            </q-card-section>
            <q-card-actions align="right" class="form_actions">
                <q-btn label="Cancel" @click="onDialogCancel"></q-btn>
                <q-btn label="Pick" @click="onDialogOK(selectedColor)" color="primary"></q-btn>
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, withDefaults, ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';

const props = withDefaults(defineProps<{ currentColor: string, defaultColor?: string; }>(), { defaultColor: "#fff" });
const selectedColor = ref<string>(props.currentColor.slice());

defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

</script>


<style>
.form_actions button {
    width: 100px;
}
</style>