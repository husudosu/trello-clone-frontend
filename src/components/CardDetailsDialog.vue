<template>
    <q-dialog maximized :fullWidth="true" :fullHeight="true" @hide="onDialogHide" ref="dialogRef">
        <q-layout view="hHh lpR lFf" container class="bg-grey-1" v-if="card">
            <q-header class="bg-primary">
                <q-toolbar>
                    <q-btn flat @click="leftDrawerVisible = !leftDrawerVisible" round dense icon="info"
                        v-if="$q.screen.xs" />
                    <q-toolbar-title
                        @dblclick="hasPermission(BoardPermission.CARD_EDIT) ? editCardTitle = !editCardTitle : false"
                        class="text-h6">
                        <template v-if="!editCardTitle">
                            {{ card?.title }}
                        </template>
                        <template v-else>
                            <q-input v-model="card.title" @blur="onTitleEdit" @keydown.enter="onTitleEdit" autofocus
                                :input-style="{ color: 'white' }">
                            </q-input>
                        </template>
                    </q-toolbar-title>
                    <q-btn flat dense :icon="!card.archived ? 'archive' : 'delete'" @click="onDeleteClicked"
                        :color="!card.archived ? 'orange' : 'red'"></q-btn>
                    <q-btn flat v-close-popup round dense icon="close" />
                </q-toolbar>
                <div class="q-pa-sm q-pl-md row items-center">
                    <span class="q-mr-sm">
                        <q-icon name="add"></q-icon>
                        Add:
                    </span>
                    <q-btn size="sm" flat icon="checklist" align="between" label="Checklist" text-color="light-green-3"
                        :disable="!hasPermission(BoardPermission.CHECKLIST_CREATE)"
                        @click="onCreateChecklistClicked"></q-btn>
                    <q-btn size="sm" flat icon="person" align="between" label="Member" text-color="light-green-3"
                        :disable="!hasPermission(BoardPermission.CARD_ASSIGN_MEMBER)"
                        @click="onAssignMemberClicked"></q-btn>
                    <q-btn size="sm" flat icon="schedule" align="between" label="Date" @click="onAddDateClicked"
                        text-color="light-green-3" :disable="!hasPermission(BoardPermission.CARD_ADD_DATE)"></q-btn>
                    <q-btn size="sm" flat icon="attach_file" align="between" label="File" text-color="light-green-3"
                        @click="onFileAddClicked"></q-btn>
                </div>
                <q-bar v-if="card.archived" class="bg-orange-4 text-black text-center">
                    <span class="text-center">Archived on: <b>{{
                        card.archived_on.format("YYYY-MM-DD HH:mm")
                    }}</b></span><q-space></q-space>
                    <q-btn label="Revert" @click="onCardRevertClicked" flat outline color="accent"></q-btn>
                </q-bar>
                <q-bar v-if="card.board_list.archived" class="bg-orange-4 text-black text-center">
                    This card is on an archived list: <b>{{ card.board_list.title }}</b>
                </q-bar>

            </q-header>
            <q-drawer show-if-above v-model="leftDrawerVisible" side="left" :width="$q.screen.xs ? 250 : 120"
                :breakpoint="400" class="bg-primary text-white">
                <q-tabs v-model="tab" dense vertical indicator-color="green-8">
                    <q-tab name="info" label="Info"></q-tab>
                    <q-tab name="history" label="History"></q-tab>
                    <q-tab name="github" label="Github issue"></q-tab>

                </q-tabs>
            </q-drawer>
            <q-page-container>
                <q-page>
                    <q-tab-panels v-model="tab" animated>
                        <q-tab-panel name="info" class="fit bg-grey-1">
                            <div>
                                <template v-if="card.assigned_members.length > 0">
                                    <user-avatar class="q-mr-xs" v-for="member in card.assigned_members" size="md"
                                        :rounded="false" :user="member.board_user.user" :key="member.id"
                                        :show-delete="hasPermission(BoardPermission.CARD_DEASSIGN_MEMBER)"
                                        @delete="onDeassignMember(member)"></user-avatar>

                                </template>

                                <!-- Card dates -->
                                <card-dates v-if="card.dates.length > 0"></card-dates>

                                <!-- Card  description -->
                                <q-expansion-item q-expansion-item default-opened icon="article" label="Description"
                                    class="q-mt-md" header-class="cardDetailsExpansionItem">
                                    <div class="q-list--bordered card-description"
                                        @dblclick="hasPermission(BoardPermission.CARD_EDIT) ? editCardDescription = !editCardDescription : false">
                                        <template v-if="!editCardDescription">
                                            <div class="markdown-body" style="margin-left: 5px; margin-right: 5px;"
                                                v-html="cardDescription"></div>
                                        </template>
                                        <template v-else>
                                            <q-input v-model="card.description" type="textarea"
                                                @keydown.enter="onDescriptionEdit" autofocus>
                                            </q-input>
                                        </template>
                                    </div>
                                </q-expansion-item>

                                <!-- Card checklists -->
                                <q-expansion-item q-expansion-item default-opened icon="checklist" label="Checklists"
                                    class="q-mt-md" header-class="cardDetailsExpansionItem">
                                    <div v-for="checklist in card.checklists" :key="checklist.id">
                                        <card-checklist :checklist="checklist"></card-checklist>
                                    </div>
                                    <div v-if="card.checklists.length === 0">
                                        No checklists yet.
                                    </div>
                                </q-expansion-item>

                                <q-expansion-item q-expansion-item default-opened icon="attach_file" label="Files"
                                    class="q-mt-md" header-class="cardDetailsExpansionItem">
                                    TODO: implement it
                                </q-expansion-item>
                                <!-- Activity -->
                                <q-expansion-item q-expansion-item default-opened icon="view_list" label="Activity"
                                    class="q-mt-md" header-class="cardDetailsExpansionItem">
                                    <div class="q-pa-md" style="width:100%;">
                                        <q-input v-model="newComment" type="textarea" placeholder="New comment..."
                                            autofocus @keydown.enter="onNewCommentKeyddown"
                                            :disable="!hasPermission(BoardPermission.CARD_COMMENT)" autogrow />
                                        <q-btn class="q-mt-sm" size="sm" color="primary"
                                            :disable="newComment.length == 0" @click="addNewComment">Send</q-btn>
                                    </div>
                                    <div class="card-comments">
                                        <q-list padding bordered>
                                            <template v-if="activities && activities.length > 0">
                                                <card-activity v-for="activity in activities" :key="activity.id"
                                                    :activity="activity">
                                                </card-activity>
                                            </template>
                                            <template v-else>
                                                <span class="q-ma-sm">No activity yet</span>
                                            </template>
                                        </q-list>
                                    </div>
                                </q-expansion-item>
                            </div>
                        </q-tab-panel>

                        <q-tab-panel name="history" class="fit bg-grey-1">
                            <div>
                                <CardHistoryTab :card-id="props.cardId"></CardHistoryTab>
                            </div>
                        </q-tab-panel>

                        <q-tab-panel name="github" class="fit bg-grey-1">
                            <div>
                                TODO Implement github issue handling
                            </div>
                        </q-tab-panel>
                    </q-tab-panels>
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
import CardHistoryTab from './Board/Card/CardHistoryTab.vue';
import UserAvatar from './UserAvatar.vue';
import CardDates from './Board/Card/Details/CardDates.vue';

import { useSocketIO, SIOBoardEventListeners, SIOEvent } from "@/socket";

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

const tab = ref("info");
const leftDrawerVisible = ref(false);
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

const onFileAddClicked = () => {
    alert("Todo: Implement it!");
};
onUnmounted(() => {
    cardStore.unloadCard();
    console.debug("Unmounted dialog, disconnect from Socket.IO");
    socket.disconnect();
});

</script>

<style lang="scss">
@import "../styles/cardDetails.scss";

.cardDetailsExpansionItem {
    padding-left: 2px;
    padding-right: 2px;
    background-color: #E0E0E0;
}
</style>
