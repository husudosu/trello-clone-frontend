<template>
    <q-dialog ref="dialogRef" @hide="onDialogHide">
        <q-card class="q-dialog-plugin">
            <q-card-section>
                <div class="text-h6">Assign member</div>
            </q-card-section>
            <q-card-section>
                <q-select v-model="member" :options="boardUsers" option-value="id"
                    :option-label="opt => Object(opt) === opt && 'user' in opt ? opt.user.name || opt.user.username : 'N/A'">
                </q-select>
            </q-card-section>
            <q-card-actions align="right">
                <q-btn color="primary" label="Cancel" flat @click="onDialogCancel" />
                <q-btn color="primary" label="OK" flat @click="onOKClick" />
            </q-card-actions>
        </q-card>
    </q-dialog>
</template>

<script setup lang="ts">
import { defineEmits, ref, computed, defineProps, withDefaults } from 'vue';
import { useDialogPluginComponent } from 'quasar';
import store from "@/store";

interface Props {
    showOnlyNotAssignedMembers?: boolean;
}

const props = withDefaults(defineProps<Props>(), { showOnlyNotAssignedMembers: true });

const member = ref();

const boardUsers = computed(() => {
    if (props.showOnlyNotAssignedMembers) {
        return store.state.board.users.filter((boardUser) => {
            const isAssigned = store.state.card.card?.assigned_members.find((assignment) => assignment.board_user.id == boardUser.id);
            if (!boardUser.is_deleted && isAssigned == undefined) {
                return boardUser;
            }
        });
    }
    else {
        return store.state.board.users;
    }
});
defineEmits([
    ...useDialogPluginComponent.emits
]);

const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent();
// dialogRef      - Vue ref to be applied to QDialog
// onDialogHide   - Function to be used as handler for @hide on QDialog
// onDialogOK     - Function to call to settle dialog with "ok" outcome
//                    example: onDialogOK() - no payload
//                    example: onDialogOK({ /*...*/ }) - with payload
// onDialogCancel - Function to call to settle dialog with "cancel" outcome

// this is part of our example (so not required)
function onOKClick() {
    // on OK, it is REQUIRED to
    // call onDialogOK (with optional payload)
    onDialogOK(member.value);
    // or with payload: onDialogOK({ ... })
    // ...and it will also hide the dialog automatically
}
</script>