<template>
    <q-dialog :fullWidth="true" :fullHeight="true" :maximized="$q.screen.xs" @hide="onDialogHide" ref="dialogRef">
        <q-layout view="hHh lpR fFf" container class="bg-white" v-if="card">
            <q-header class="bg-primary">
                <q-toolbar>
                    <q-toolbar-title
                        @dblclick="hasPermission(BoardPermission.CARD_EDIT) ? editCardTitle = !editCardTitle : false"
                        class="text-h6">
                        <template v-if="!editCardTitle">
                            {{ card?.title }}
                        </template>
                        <template v-else>
                            <q-input v-model="card.title" @blur="onTitleEdit" @keydown.enter="onTitleEdit" autofocus>
                            </q-input>
                        </template>
                    </q-toolbar-title>
                    <q-btn flat @click="rightDrawerVisible = !rightDrawerVisible" round dense icon="settings" />
                    <q-btn flat v-close-popup round dense icon="close" />
                </q-toolbar>
            </q-header>
            <!-- Right side menu-->
            <q-drawer side="right" v-model="rightDrawerVisible" :width="250" :breakpoint="400" class="bg-white q-pa-sm"
                show-if-above>
                <span class="text-h5">Card settings</span>
                <div class="q-pa-md q-gutter-md">
                    <q-btn align="between" class="full-width" icon="person" dense
                        :disable="!hasPermission(BoardPermission.CARD_ASSIGN_MEMBER)" @click="onAssignMemberClicked">
                        Members
                    </q-btn>
                    <q-btn align="between" class="full-width" icon="checklist" dense
                        :disable="!hasPermission(BoardPermission.CHECKLIST_CREATE)" @click="onCreateChecklistClicked">
                        Checklist
                    </q-btn>
                    <q-btn align="between" class="full-width" icon="schedule" dense @click="onAddDateClicked"
                        :disable="!hasPermission(BoardPermission.CARD_ADD_DATE)">Date
                    </q-btn>
                    <q-btn align="between" class="full-width" icon="history" dense @click="onHistoryClicked">History
                    </q-btn>
                    <q-btn align="between" class="full-width" :icon="!card.archived ? 'archive' : 'delete'" dense
                        @click="onDeleteClicked" :disable="!hasPermission(BoardPermission.CARD_EDIT)">{{ !card.archived
    ? 'Archive' : 'Delete'
                        }}
                    </q-btn>

                    <template v-if="card.assigned_members.length > 0">
                        <div>Assigned members:</div>
                        <div class="row">
                            <user-avatar class="q-mr-xs" v-for="member in card.assigned_members" size="sm"
                                :rounded="false" :user="member.board_user.user" :key="member.id"
                                :show-delete="hasPermission(BoardPermission.CARD_DEASSIGN_MEMBER)"
                                @delete="onDeassignMember(member)"></user-avatar>
                        </div>
                    </template>
                </div>
            </q-drawer>
            <q-page-container>
                <q-page padding>
                    <q-bar v-if="card.board_list.archived" class="bg-orange-4 q-mb-sm">
                        This card is on an archived list: {{ card.board_list.title }}
                    </q-bar>
                    <q-bar v-if="card.archived" class="bg-orange-4 q-mb-sm">This card archived on: {{
                        card.archived_on.format("YYYY-MM-DD HH:mm")
                    }}
                        <q-space /> <q-btn color="primary" flat outline
                            @click="onCardRevertClicked">Revert</q-btn></q-bar>

                    <card-dates v-if="card.dates.length > 0"></card-dates>
                    <div class="row q-mb-sm">
                        <q-icon name="article" class="q-mr-sm text-h5" style="top: 6px;"> </q-icon>
                        <span class="text-h5">
                            <span>Description</span>
                        </span>
                    </div>
                    <!--class="qa-pa-md q-list--bordered card-description"-->
                    <div class="q-list--bordered card-description"
                        @dblclick="hasPermission(BoardPermission.CARD_EDIT) ? editCardDescription = !editCardDescription : false">
                        <template v-if="!editCardDescription">
                            <div class="markdown-body" style="margin-left: 5px; margin-right: 5px;"
                                v-html="cardDescription"></div>
                        </template>
                        <template v-else>
                            <q-input v-model="card.description" type="textarea" @keydown.enter="onDescriptionEdit"
                                autofocus>
                            </q-input>
                        </template>
                    </div>
                    <template v-if="card.checklists.length > 0">
                        <div class="row q-mb-sm q-mt-sm">
                            <q-icon name="checklist" class="q-mr-sm text-h5" style="top: 6px;"> </q-icon>
                            <span class="text-h5">
                                <span>Checklists</span>
                            </span>
                        </div>
                        <div v-for="checklist in card.checklists" :key="checklist.id">
                            <card-checklist :checklist="checklist"></card-checklist>
                        </div>
                    </template>
                    <div class="row justify-between">
                        <div class="q-mb-sm q-mt-sm">
                            <q-icon name="view_list" class="q-mr-sm text-h5" style="top: -2px;"> </q-icon>
                            <span class="text-h5">
                                <span>Activity</span>
                            </span>
                        </div>
                    </div>
                    <div class="q-pa-md" style="width:100%;">
                        <q-input v-model="newComment" type="textarea" placeholder="New comment..." autofocus
                            @keydown.enter="onNewCommentKeyddown"
                            :disable="!hasPermission(BoardPermission.CARD_COMMENT)" autogrow />
                        <q-btn class="q-mt-sm" size="sm" color="primary" :disable="newComment.length == 0"
                            @click="addNewComment">Save</q-btn>
                    </div>
                    <div class="card-comments">
                        <q-list padding bordered>
                            <template v-if="activities && activities.length > 0">
                                <card-activity v-for="activity in activities" :key="activity.id" :activity="activity">
                                </card-activity>
                            </template>
                            <template v-else>
                                <span class="q-ma-sm">No activity yet</span>
                            </template>
                        </q-list>
                    </div>
                </q-page>
            </q-page-container>
        </q-layout>
    </q-dialog>

</template>

<script lang="ts" setup>
import { useDialogPluginComponent } from 'quasar';

import { computed, ref, defineEmits, defineProps, onMounted, onUnmounted } from 'vue';
import { useQuasar } from 'quasar';
import * as DOMPurify from 'dompurify';
import { marked } from 'marked';

import { BoardPermission, IBoardAllowedUser, ICardMember, IDraftCardDate } from "@/api/types";
import { CardAPI } from '@/api/card';
import CardActivity from './Board/Card/CardActivity.vue';
import CardChecklist from './Board/Card/Checklist/CardChecklist.vue';
import AssignMember from './Board/Card/AssignMember.vue';
import CardDateDialog from './Board/Card/CardDateDialog.vue';

import UserAvatar from './UserAvatar.vue';
import CardDates from './Board/Card/Details/CardDates.vue';

import { useSocketIO, SIOBoardEventListeners, SIOEvent } from "@/socket";
import CardHistoryDialog from './Board/Card/CardHistoryDialog.vue';

import 'github-markdown-css/github-markdown-light.css';
import { useCardStore } from '@/stores/card';
import { useBoardStore } from '@/stores/board';
interface Props {
    cardId: number;
}

const props = defineProps<Props>();

const { socket } = useSocketIO();

const $q = useQuasar();
const boardStore = useBoardStore();
const cardStore = useCardStore();

const hasPermission = boardStore.hasPermission;

const card = computed(() => cardStore.card);
const activities = computed(() => cardStore.activityList);
const cardDescription = computed(() => {
    if (cardStore.card?.description) {
        return marked.parse(DOMPurify.sanitize(cardStore.card.description));
    } else {
        return "";
    }
});

const rightDrawerVisible = ref(false);
const newComment = ref("");
const editCardDescription = ref(false);
const editCardTitle = ref(false);
const socketWereDisconnected = ref(false);



defineEmits([
    ...useDialogPluginComponent.emits
]);
const { dialogRef, onDialogHide } = useDialogPluginComponent();

onMounted(async () => {
    try {
        $q.loading.show({ delay: 150 });

        socket.onAny((event: string) => {
            console.debug(`[Socket.IO->CardDetailsDialog]: Got event: ${event}`);
        });

        socket.on(SIOEvent.CARD_ACTIVITY, SIOBoardEventListeners.onCardActivity);
        socket.on(SIOEvent.CHECKLIST_ITEM_UPDATE_ORDER, SIOBoardEventListeners.updateChecklistItemOrder);

        socket.on(SIOEvent.CARD_ACTIVITY_UPDATE, SIOBoardEventListeners.updateCardActivity);
        socket.on(SIOEvent.CARD_ACTIVITY_DELETE, SIOBoardEventListeners.deleteCardActivity);

        socket.on(SIOEvent.SIODisconnect, (reason) => {
            console.log(`[CardDetailsDialog->Socket.IO]: Disconnected from SIO server reason: ${reason}`);
            socketWereDisconnected.value = true;
            if (reason !== "io client disconnect") {
                $q.notify({
                    message: "Connection lost to server",
                    type: "negative",
                    position: "bottom-right"
                });
            }
        });
        socket.on(SIOEvent.SIOConnect, async () => {
            socket.emit("card_change", { card_id: props.cardId });
            await cardStore.loadCard(props.cardId);
            if (socketWereDisconnected.value) {
                $q.notify({
                    message: "Reconnected",
                    type: "positive",
                    position: "bottom-right"
                });
                socketWereDisconnected.value = false;
            }
        });
    }
    catch (err) {
        console.log(err);
        $q.notify({
            position: "bottom-right",
            type: "negative",
            message: "Cannot load card."
        });
        onDialogHide();
    }
    finally {
        $q.loading.hide();
    }
});

const addNewComment = async () => {
    if (card.value) {
        try {
            await CardAPI.postCardComment(card.value.id, { comment: newComment.value });
            newComment.value = "";
        } catch (err) {
            console.log(err);
        }
    }

};

const onNewCommentKeyddown = async (e: KeyboardEvent) => {
    if (e.ctrlKey && newComment.value.length > 0) {
        addNewComment();
    }
};

const onDescriptionEdit = async (e: KeyboardEvent) => {
    if (e.ctrlKey && card.value && card.value.id && card.value.description) {
        editCardDescription.value = false;
        CardAPI.patchCard(card.value.id, { description: card.value.description });
    }
};

const onTitleEdit = async () => {
    if (card.value && card.value.title && card.value.id) {
        editCardTitle.value = false;
        await CardAPI.patchCard(card.value.id, { title: card.value.title });
    }
};

const onHistoryClicked = () => {
    $q.dialog({
        component: CardHistoryDialog,
        componentProps: { cardId: props.cardId }
    });
};

const onDeleteClicked = () => {
    const type = !card.value?.archived ? "Archive" : "Delete";

    $q.dialog({
        title: `${type} card`,
        cancel: true,
        persistent: true,
        message: `${type} card ${card.value ? card.value.title : ''}?`,
        ok: {
            label: type,
            color: "negative"
        }
    }).onOk(() => {
        if (card.value) {
            CardAPI.deleteCard(card.value.id);
            onDialogHide();
        }
    });
};

const onCardRevertClicked = () => {
    CardAPI.patchCard(props.cardId, { archived: false });
};


const onCreateChecklistClicked = () => {
    $q.dialog({
        title: "New checklist",
        message: "Title",
        prompt: {
            model: "",
            type: "text"
        },
        cancel: true,
        persistent: true
    }).onOk(async data => await cardStore.postChecklist({ title: data }));
};

const onAssignMemberClicked = () => {
    $q.dialog({
        component: AssignMember,
    }).onOk((data: IBoardAllowedUser) => {
        cardStore.postCardMemberAssignment({ board_user_id: data.id, send_notification: true });
    });
};

const onDeassignMember = async (member: ICardMember) => {
    try {
        await CardAPI.deassignCardMember(props.cardId, member.board_user.id);
    }
    catch (err) {
        console.log(err);
    }
};

const onAddDateClicked = () => {
    $q.dialog({
        component: CardDateDialog
    }).onOk(async (data: IDraftCardDate) => {
        await CardAPI.postCardDate(props.cardId, data);
    });
};

onUnmounted(() => {
    cardStore.unloadCard();
    console.debug("Unmounted dialog, disconnect from Socket.IO");
    socket.disconnect();
});

</script>

<style lang="scss">
@import "../styles/cardDetails.scss";
</style>
