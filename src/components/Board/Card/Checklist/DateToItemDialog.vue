<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-card-section>
                <div class="text-h6">Date</div>
            </q-card-section>
            <q-form ref="frm">
                <q-card-section>
                    <q-input v-model="dt" mask="####-##-## ##:##" :rules="[validateDateTime]" fill-mask>
                        <template v-slot:prepend>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="dt" mask="YYYY-MM-DD HH:mm">
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
                                    <q-time v-model="dt" mask="YYYY-MM-DD HH:mm" format24h>
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary" flat />
                                        </div>
                                    </q-time>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                </q-card-section>
                <q-card-actions align="right">
                    <q-btn color="primary" label="Cancel" flat @click="onDialogCancel" />
                    <q-btn color="primary" label="Save" flat @click="onOKClick" />
                </q-card-actions>
            </q-form>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { defineEmits, ref, defineProps, onMounted } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import { validateDateTime } from "@/formValidators";
import moment from "moment-timezone";

defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

interface Props {
    dt?: moment.Moment;
}
const props = defineProps<Props>();

const frm = ref();
const dt = ref();

function onOKClick() {
    frm.value.validate().then((success: boolean) => {
        if (success) {
            onDialogOK(dt.value);
        }
    });
}

onMounted(() => {
    // If got cardDate prop we should edit the date
    if (props.dt)
        dt.value = props.dt.format("YYYY-MM-DD HH:mm");
});
</script>