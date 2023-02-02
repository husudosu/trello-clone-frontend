<template>
    <q-list>
        <div v-if="props.files.length === 0">
            No uploaded files yet.
        </div>
        <q-item v-for="file in props.files" :key="file.id">
            <q-item-section>
                <q-item-label>
                    {{ file.file_name }}
                </q-item-label>
                <q-item-label caption>{{ file.created_on.format("YYYY-MM-DD HH:mm:ss") }}</q-item-label>
            </q-item-section>
            <q-item-section side>
                <div class="row">
                    <q-btn icon="delete" flat color="red" size="sm"
                        :disable="!boardStore.hasPermission(BoardPermission.FILE_DELETE)"
                        @click="onDeleteFileClicked(file)"></q-btn>
                    <q-btn icon="download" flat color="green" size="sm"
                        :disable="!boardStore.hasPermission(BoardPermission.FILE_DOWNLOAD)"
                        @click="onDownloadFileClicked(file)"></q-btn>
                </div>
            </q-item-section>
        </q-item>
    </q-list>

</template>

<script lang="ts" setup>
import { defineProps } from 'vue';
import { CardAPI } from '@/api/card';
import { ICardFileUpload, BoardPermission } from "@/api/types";
import { useQuasar } from 'quasar';
import { useBoardStore } from '@/stores/board';

const $q = useQuasar();

const props = defineProps<{ files: ICardFileUpload[]; }>();

const boardStore = useBoardStore();
const onDeleteFileClicked = (file: ICardFileUpload) => {
    $q.dialog({
        title: "Delete file",
        cancel: true,
        persistent: true,
        message: `Delete ${file.file_name}? This is permanent!`,
        ok: {
            label: "Delete",
            color: "negative"
        }
    }).onOk(() => {
        CardAPI.deleteFile(file.id);
    });
};

const onDownloadFileClicked = (file: ICardFileUpload) => {
    CardAPI.downloadFile(file.id, file.file_name);
};
</script>