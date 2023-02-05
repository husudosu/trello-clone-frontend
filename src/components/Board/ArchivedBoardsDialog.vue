<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card style="width: 600px;">
            <q-card-section>
                <q-toolbar color="primary">
                    <q-toolbar-title>Archived boards</q-toolbar-title>
                    <q-btn flat round dense icon="close" v-close-popup />
                </q-toolbar>
            </q-card-section>

            <q-card-section>
                <q-list padding bordered>

                    <q-item v-for="board in archivedBoards" :key="board.id"
                        :to="{ name: 'board', params: { boardId: board.id } }" clickable>
                        <q-item-section>
                            <q-item-label>{{ board.title }}</q-item-label>
                            <q-item-label caption lines="1">{{ board.archived_on }}</q-item-label>
                        </q-item-section>
                    </q-item>
                    <q-item v-if="archivedBoards.length === 0">
                        <q-item-label>No archived boards yet.</q-item-label>
                    </q-item>
                </q-list>
            </q-card-section>
        </q-card>
    </q-dialog>
</template>
<script lang="ts" setup>
import { ref, defineEmits, onMounted } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { BoardAPI } from '@/api/board';
import { IBoard } from '@/api/types';

const $q = useQuasar();
defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide } = useDialogPluginComponent();

const archivedBoards = ref<IBoard[]>([]);

onMounted(async () => {
    try {
        $q.loading.show({ delay: 180 });
        archivedBoards.value = await BoardAPI.getArchivedBoards();
    }
    finally {
        $q.loading.hide();
    }
});
</script>