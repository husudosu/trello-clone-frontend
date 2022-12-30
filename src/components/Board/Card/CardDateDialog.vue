<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-card-section>
                <div class="text-h6">Date</div>
            </q-card-section>
            <q-form ref="frm">
                <q-card-section>
                    <q-input v-model="cardDate.dt_from" mask="####-##-## ##:##" :rules="[validateDateTime]"
                        label="Start date" :disable="!isRange" fill-mask>
                        <template v-slot:before>
                            <q-checkbox v-model="isRange" dense></q-checkbox>
                        </template>
                        <template v-slot:prepend>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="cardDate.dt_from" mask="YYYY-MM-DD HH:mm">
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
                                    <q-time v-model="cardDate.dt_from" mask="YYYY-MM-DD HH:mm" format24h>
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary" flat />
                                        </div>
                                    </q-time>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <q-input v-model="cardDate.dt_to" mask="####-##-## ##:##" :rules="[validateDateTime]"
                        label="Due date" fill-mask>
                        <template v-slot:prepend>
                            <q-icon name="event" class="cursor-pointer">
                                <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                    <q-date v-model="cardDate.dt_to" mask="YYYY-MM-DD HH:mm">
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
                                    <q-time v-model="cardDate.dt_to" mask="YYYY-MM-DD HH:mm" format24h>
                                        <div class="row items-center justify-end">
                                            <q-btn v-close-popup label="Close" color="primary" flat />
                                        </div>
                                    </q-time>
                                </q-popup-proxy>
                            </q-icon>
                        </template>
                    </q-input>
                    <q-input v-model="cardDate.description" label="Description" type="textarea"></q-input>
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
import { CardDate, DraftCardDate } from "@/api/types";
import { validateDateTime } from "@/formValidators";

defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();

interface Props {
    cardDate?: CardDate;
}
const props = defineProps<Props>();

const frm = ref();
const isRange = ref(false);
const cardDate = ref<DraftCardDate>({
    dt_to: "",
    description: "",
    complete: false
});


function onOKClick() {
    frm.value.validate().then((success: boolean) => {
        if (success) {
            // Remove dt_from if isRange disabled.
            if (!isRange.value) {
                // FIXME: I don't know why TSC complains about being this null, type allows null/undefined variables!
                cardDate.value.dt_from = undefined;
            }

            onDialogOK(cardDate.value);
        }
    });
}

onMounted(() => {
    // If got cardDate prop we should edit the date
    if (props.cardDate) {
        // Convert dates to string
        if (props.cardDate.dt_from) {
            cardDate.value.dt_from = props.cardDate.dt_from.format("YYYY-MM-DD HH:mm");
            isRange.value = true;
        }
        cardDate.value.dt_to = props.cardDate.dt_to.format("YYYY-MM-DD HH:mm");
        cardDate.value.description = props.cardDate.description;
    }
});
</script>