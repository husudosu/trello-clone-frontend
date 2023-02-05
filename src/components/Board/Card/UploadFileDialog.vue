<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card style="width: 400px;">
            <q-card-section>
                <q-toolbar color="primary">
                    <q-toolbar-title>Upload file</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </q-card-section>
            <q-form @submit="onSubmit" class="q-gutter-md">
                <q-card-section>
                    <q-file outlined v-model="file">
                        <template v-slot:prepend>
                            <q-icon name="attach_file" />
                        </template>
                    </q-file>
                </q-card-section>
                <q-card-actions class="form_actions" align="right">
                    <q-btn type="submit" color="primary" class="full-width">Upload</q-btn>
                </q-card-actions>

            </q-form>
        </q-card>
    </q-dialog>

</template> 
<script lang="ts" setup>
import { ref, defineEmits } from 'vue';
import { useDialogPluginComponent } from 'quasar';

defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();

const file = ref();

const onSubmit = async () => {
    onDialogOK({
        file: file.value
    });
};
</script>
