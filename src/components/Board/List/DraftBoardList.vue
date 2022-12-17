<template>
    <div class="listWrapper">
        <div class="list">
            <header class="listHeader">
                <q-input v-model="listTitle" label="Name" @keyup.enter="onListSave" @keyup.esc="$emit('cancel')"
                    @blur="onTitleBlur" autofocus>
                </q-input>
            </header>
            <ul></ul>
            <footer>
                <q-btn size="sm" class="q-ml-xs q-mr-sm" color="primary" @click="onListSave"
                    :disable="listTitle.length === 0">Save</q-btn>
                <q-btn size="sm" outline @click="$emit('cancel')" class="draftBoardCancelButton">Cancel</q-btn>
            </footer>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, defineEmits } from "vue";

const emit = defineEmits(["save", "cancel"]);
const listTitle = ref("");

const onTitleBlur = (ev: any) => {
    let relatedTargetClasses = [];
    if (ev.relatedTarget)
        relatedTargetClasses = ev.relatedTarget.getAttribute("class").split(" ");
    if (!relatedTargetClasses.includes("draftBoardCancelButton") && listTitle.value.length > 0) {
        onListSave();
    }
    else {
        emit("cancel");
    }
};

const onListSave = () => {
    emit("save", { title: listTitle.value });
}

</script>