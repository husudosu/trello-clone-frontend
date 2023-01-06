<template>
    <q-item dense class="q-mb-md">
        <q-item-section top avatar>
            <user-avatar :user="props.activity.board_user.user" :show-tooltip="false" size="md"></user-avatar>
        </q-item-section>

        <q-item-section>
            <q-item-label>
                <div class="row justify-between">
                    <b>{{ props.activity.board_user.user.name }} ({{ props.activity.board_user.user.username }})</b>
                    <span>
                        <template
                            v-if="props.activity.event == CardActivityEvent.CARD_COMMENT && canEdit && !props.showCardTitle">
                            <q-btn @click="onEditClicked" flat size="sm" dense class="q-ml-xs">
                                <q-icon name="edit"></q-icon>
                            </q-btn>
                            <q-btn @click="deleteCardActivity" flat size="sm" dense class="q-ml-xs">
                                <q-icon name="delete"></q-icon>
                            </q-btn>
                        </template>
                        <span class="text-bold" v-if="props.showCardTitle && props.activity.card_id">
                            On card <a href="javascript:void(0);" @click="onCardClicked(props.activity.card_id)">#{{
                                props.activity.card_id
                            }}</a>
                        </span>
                        {{
                            props.activity.comment?.updated?.isValid() ?
                                "Updated: " + props.activity.comment?.updated?.format("YYYY-MM-DD HH:mm:ss")
                                : props.activity.activity_on.format("YYYY-MM-DD HH:mm:ss")
                        }}
                    </span>
                </div>
            </q-item-label>
            <q-item-label caption>
                <template v-if="props.activity.event == CardActivityEvent.CARD_COMMENT">
                    <template v-if="!editMode">
                        <div class="rounded-borders	q-pa-sm cardComment">
                            <span style="white-space: pre-wrap;">{{
                                activity?.comment?.comment
                            }}</span>
                        </div>
                    </template>
                    <template v-else>
                        <q-input v-model="updatedComment" type="textarea"></q-input>
                        <q-btn color="primary" flat @click="onSaveClicked">Save</q-btn>
                        <q-btn color="primary" flat @click="editMode = false">Cancel</q-btn>
                    </template>
                </template>
                <template v-else>
                    <div v-html="createActivityText()"></div>
                </template>
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<script lang="ts" setup>
import { defineProps, ref, withDefaults } from "vue";
import { CardActivityEvent, ICardActivity, BoardActivityEvent } from "@/api/types";
import UserAvatar from "@/components/UserAvatar.vue";
import { useQuasar } from "quasar";
import { CardAPI } from "@/api/card";
import CardDetailsDialog from "@/components/CardDetailsDialog.vue";
import { useBoardStore } from "@/stores/board";

interface Props {
    activity: ICardActivity;
    showCardTitle?: boolean;
}
const props = withDefaults(defineProps<Props>(), { showCardTitle: false });
const $q = useQuasar();
const boardStore = useBoardStore();

const canEdit = boardStore.boardUser?.id === props.activity.board_user_id || boardStore.isAdmin;
const editMode = ref(false);
const updatedComment = ref("");

const onEditClicked = () => {
    editMode.value = !editMode.value;
    if (props.activity.comment?.comment)
        updatedComment.value = props.activity.comment.comment;
};

const onSaveClicked = () => {
    editMode.value = false;
    if (props.activity.comment?.id) {
        CardAPI.patchCardComment(props.activity.comment.id, { comment: updatedComment.value });
    }
};

const deleteCardActivity = () => {
    $q.dialog({
        message: "Delete comment?",
        cancel: true,
        ok: {
            label: "Delete",
            color: "negative"
        }
    }).onOk(() => {
        if (props.activity.comment && props.activity.comment.id)
            CardAPI.deleteComment(props.activity.comment.id);
    });
};

const createActivityText = () => {
    switch (props.activity.event) {
        case BoardActivityEvent.BOARD_CREATE:
            return "Board has been created";
        case BoardActivityEvent.BOARD_ARCHIVE:
            return "Board archived";
        case BoardActivityEvent.BOARD_CHANGE_TITLE:
            break;
        case BoardActivityEvent.BOARD_CHANGE_OWNER:
            break;
        case BoardActivityEvent.BOARD_REVERT:
            return "Board reverted";

        case BoardActivityEvent.MEMBER_ADD:
            break;
        case BoardActivityEvent.MEMBER_ACCESS_REVOKE:
            break;
        case BoardActivityEvent.MEMBER_DELETE:
            break;
        case BoardActivityEvent.MEMBER_REVERT:
            break;
        case BoardActivityEvent.MEMBER_CHANGE_ROLE:
            break;
        case BoardActivityEvent.LIST_CREATE:
            return `List <b>${props.activity.changes.to?.title}</b> created`;
        case BoardActivityEvent.LIST_UPDATE:
            return `List <b>${props.activity.changes.from?.title}</b> renamed to <b>${props.activity.changes.to?.title}</b>`;
        case BoardActivityEvent.LIST_ARCHIVE:
            return `List <b>${props.activity.changes.to?.title}</b> #${props.activity.entity_id} archived`;
        case BoardActivityEvent.LIST_REVERT:
            return `List <b>${props.activity.changes.to?.title || '#' + props.activity.entity_id}</b> reverted`;
        case BoardActivityEvent.LIST_DELETE:
            break;
        case BoardActivityEvent.CARD_DELETE:
            break;

        case CardActivityEvent.CARD_ASSIGN_TO_LIST:
            return `Card <b>${props.activity.changes.to?.title}</b> assigned to <b>${props.activity.changes.to?.list_title}</b>.`;
        case CardActivityEvent.CARD_MOVE_TO_LIST:
            return `Moved
                    from
                    <b>${props.activity.changes.from?.title || "N/A"} </b> to
                    <b>${props.activity.changes.to?.title || "N/A"}</b>`;
        // NOTE: CARD_COMMENT handled by template conditional rendering.
        // case CardActivityEvent.CARD_COMMENT:
        //     break;
        case CardActivityEvent.CARD_ARCHIVE:
            return "Archived card";
        case CardActivityEvent.CARD_REVERT:
            return "Reverted card";
        case CardActivityEvent.CHECKLIST_CREATE:
            return `Checklist created: <b>${props.activity.changes.to?.title || "N/A"}</b>`;
        case CardActivityEvent.CHECKLIST_UPDATE:
            break;
        case CardActivityEvent.CHECKLIST_DELETE:
            return `Checklist <b>${props.activity.changes.to?.title || "N/A"}</b> deleted.`;
        case CardActivityEvent.CHECKLIST_ITEM_MARKED:
            return `<b>${props.activity.changes.to?.title}</b> marked as <b>${props.activity.changes.to?.completed ?
                'completed' :
                'not complete'
                }</b>`;
        case CardActivityEvent.CHECKLIST_ITEM_DUE_DATE:
            break;
        case CardActivityEvent.CHECKLIST_ITEM_USER_ASSIGN:
            break;
        case CardActivityEvent.CARD_ASSIGN_MEMBER:
            return `Assigned card to <b>${boardStore.getBoardUsername(props.activity.changes.to?.board_user_id)
                }</b>`;
        case CardActivityEvent.CARD_DEASSIGN_MEMBER:
            return `Deassigned card from <b>${boardStore.getBoardUsername(props.activity.changes.from?.board_user_id)
                }</b>`;
        case CardActivityEvent.CARD_ADD_DATE:
            return "Created card date.";
        case CardActivityEvent.CARD_EDIT_DATE:
            return `Updated card date: ${props.activity.changes.description || props.activity.changes.dt_to}`;
        case CardActivityEvent.CARD_DELETE_DATE:
            return "Removed card date.";
        default:
            return props.activity.event;
    }
};

const onCardClicked = (cardId: number) => {
    $q.dialog(
        {
            component: CardDetailsDialog,
            componentProps: { cardId }
        }
    );
};

</script>

<style scoped lang="scss">
.cardComment {
    width: 100%;
    border: 1px solid $separator-color;
    background-color: $grey-1;
    color: black;
}
</style>