<template>
    <q-dialog :fullWidth="true" :fullHeight="true" :maximized="$q.screen.xs" @hide="onDialogHide" ref="dialogRef">
        <q-layout view="hHh lpR fFf" container class="bg-white">
            <q-header elevated class="bg-primary text-white" height-hint="98">
                <q-toolbar>
                    <q-toolbar-title>
                        Board details
                    </q-toolbar-title>
                    <q-btn flat v-close-popup round dense icon="close" />
                </q-toolbar>

                <q-tabs align="left" v-model="tab">
                    <q-tab name="info" label="Info" />
                    <q-tab name="members" label="Members" />
                </q-tabs>
            </q-header>

            <q-page-container>
                <q-tab-panels v-model="tab" animated>
                    <q-tab-panel name="info">
                        <board-info-vue></board-info-vue>
                    </q-tab-panel>
                    <q-tab-panel name="members">
                        <board-members-vue></board-members-vue>
                    </q-tab-panel>
                </q-tab-panels>
            </q-page-container>

        </q-layout>
    </q-dialog>
</template>

<script lang="ts" setup>
import { defineEmits, ref } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import BoardInfoVue from './BoardInfo.vue';
import BoardMembersVue from './BoardMembers.vue';
const tab = ref("info");
defineEmits([
    // REQUIRED; need to specify some events that your
    // component will emit through useDialogPluginComponent()
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide } = useDialogPluginComponent();

</script>
