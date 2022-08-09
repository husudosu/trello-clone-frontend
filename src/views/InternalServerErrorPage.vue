<template>
    <q-card class="q-mt-lg q-ma-sm full-height margin">
        <q-card-section class="bg-primary text-white">
            <div class="text-h6">500 - Internal server error</div>
        </q-card-section>
        <q-card-section>
            <pre class="bg-grey-1">
                {{ route.query.traceback }}
            </pre>
        </q-card-section>

    </q-card>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router';

const route = useRoute();

</script>

<style>
pre {
    height: 300px;
    overflow: scroll;
}
</style>