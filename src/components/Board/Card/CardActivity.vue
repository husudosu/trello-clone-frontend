<template>
    <q-item dense class="q-mb-md">
        <q-item-section top avatar>
            <user-avatar :user="activity.board_user.user" :show-tooltip="false" size="md"></user-avatar>
        </q-item-section>

        <q-item-section>
            <q-item-label>
                <div class="row justify-between">

                    <b>{{ activity.board_user.user.name }} ({{ activity.board_user.user.username }})</b>
                    <span>
                        {{
                        activity.comment?.updated?.isValid() ?
                        "Updated: " + activity.comment?.updated?.format("YYYY-MM-DD HH:mm:ss")
                        : activity.activity_on.format("YYYY-MM-DD HH:mm:ss")
                        }}
                    </span>
                </div>
            </q-item-label>
            <q-item-label caption>
                <template v-if="activity.event == CardActivityEvent.CARD_COMMENT">
                    <div class="rounded-borders	 q-pa-sm cardComment">
                        <span style="white-space: pre-wrap;">{{ activity?.comment?.comment
                        }}</span>
                    </div>
                </template>
                <template v-else-if="activity.event == CardActivityEvent.CARD_MOVE_TO_LIST">Moved
                    from
                    <b>{{ activity.changes.from.title || "N/A" }} </b> to
                    <b>{{
                    activity.changes.to.title || "N/A"
                    }}</b>
                </template>
                <template v-else-if="activity.event == CardActivityEvent.CHECKLIST_CREATE">
                    Checklist created: <b>{{ activity.changes.to.title || "N/A"}}</b>
                </template>
                <template v-else-if="activity.event == CardActivityEvent.CHECKLIST_ITEM_MARKED">
                    <b>{{ activity.changes.to.title}}</b> marked as <b>{{ activity.changes.to.completed ? `completed` :
                    `not complete`}}</b>
                </template>
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { CardActivityEvent, CardActivity } from "@/api/types";
import UserAvatar from "@/components/UserAvatar.vue";
interface Props {
    activity: CardActivity;
}
const props = defineProps<Props>();
const activity = ref(props.activity);

</script>

<style scoped  lang="scss">
.cardComment {
    width: 100%;
    border: 1px solid $separator-color;
    background-color: $grey-1;
    color: black;
}
</style>