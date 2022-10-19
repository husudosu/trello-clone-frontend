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
                    <div class="rounded-borders	q-pa-sm cardComment">
                        <span style="white-space: pre-wrap;">{{ activity?.comment?.comment
                        }}</span>
                    </div>
                </template>
                <template v-else-if="props.activity.event == CardActivityEvent.CARD_MOVE_TO_LIST">Moved
                    from
                    <b>{{ props.activity.changes.from.title || "N/A" }} </b> to
                    <b>{{
                    props.activity.changes.to.title || "N/A"
                    }}</b>
                </template>
                <template v-else-if="props.activity.event == CardActivityEvent.CHECKLIST_CREATE">
                    Checklist created: <b>{{ props.activity.changes.to.title || "N/A"}}</b>
                </template>
                <template v-else-if="props.activity.event == CardActivityEvent.CHECKLIST_ITEM_MARKED">
                    <b>{{ props.activity.changes.to.title}}</b> marked as <b>{{ props.activity.changes.to.completed ?
                    `completed` :
                    `not complete`}}</b>
                </template>
                <template v-else-if="props.activity.event == CardActivityEvent.CARD_ASSIGN_MEMBER">
                    Assigned card to <b>{{ store.getters.board.getBoardUsername(props.activity.changes.to.board_user_id)
                    }}</b>
                </template>
                <template v-else-if="props.activity.event == CardActivityEvent.CARD_DEASSIGN_MEMBER">
                    Deassigned card from <b>{{
                    store.getters.board.getBoardUsername(props.activity.changes.from.board_user_id)}}</b>
                </template>
                <template v-else-if="props.activity.event == CardActivityEvent.CARD_ADD_DATE">
                    Created card date.
                </template>
                <template v-else-if="props.activity.event == CardActivityEvent.CARD_EDIT_DATE">
                    Updated card date: {{ props.activity.changes.description || props.activity.changes.dt_to}}
                </template>
                <template v-else-if="props.activity.event == CardActivityEvent.CARD_DELETE_DATE">
                    Removed card date.
                </template>
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<script lang="ts" setup>
import { defineProps } from "vue";
import { CardActivityEvent, CardActivity } from "@/api/types";
import UserAvatar from "@/components/UserAvatar.vue";
import store from "@/store";

interface Props {
    activity: CardActivity;
}
const props = defineProps<Props>();


</script>

<style scoped  lang="scss">
.cardComment {
    width: 100%;
    border: 1px solid $separator-color;
    background-color: $grey-1;
    color: black;
}
</style>