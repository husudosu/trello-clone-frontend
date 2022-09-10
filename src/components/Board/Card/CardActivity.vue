<template>
    <q-item>
        <q-item-section top avatar>
            <q-avatar rounded>
                <img src="@/assets/avatar-placeholder.png" />
            </q-avatar>
        </q-item-section>

        <q-item-section>
            <q-item-label>{{ activity.user.name }} ({{ activity.user.username }})
            </q-item-label>
            <q-item-label caption>
                <template v-if="activity.event == CardActivityEvent.CARD_COMMENT">
                    <span style="white-space: pre-wrap;">{{ activity?.comment?.comment
                    }}</span>
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
        <q-item-section side top>
            <q-item-label caption>
                {{
                activity.comment?.updated?.isValid() ?
                "Updated: " + activity.comment?.updated?.format("YYYY-MM-DD HH:mm:ss")
                : activity.activity_on.format("YYYY-MM-DD HH:mm:ss")
                }}
            </q-item-label>
        </q-item-section>
    </q-item>
</template>

<script lang="ts" setup>
import { defineProps, ref } from "vue";
import { CardActivityEvent, CardActivity } from "@/api/types";

interface Props {
    activity: CardActivity;
}
const props = defineProps<Props>();
const activity = ref(props.activity);

</script>