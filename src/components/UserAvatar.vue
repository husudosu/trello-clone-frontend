<template>
    <div class="non-selectable">
        <q-avatar ref="avatar" :size="size" :rounded="rounded" text-color="white"
            :style="{ 'background-color': calculateAvatarColor() }">
            {{ initials }}
        </q-avatar>
        <q-tooltip v-if="props.showTooltip">{{ props.user.name || props.user.username }}</q-tooltip>
        <q-btn size="xs" dense flat v-if="props.showDelete" @click="$emit('delete', $event)">
            <q-icon name="remove" color="red"></q-icon>
        </q-btn>

    </div>
</template>

<script lang="ts" setup>
import { IUserBasicInfo } from '@/api/types';
import { defineProps, ref, onBeforeMount, withDefaults, defineEmits } from 'vue';

defineEmits(["delete"]);

interface Props {
    size?: string;
    rounded?: boolean;
    showTooltip?: boolean;
    user: IUserBasicInfo;
    showDelete?: boolean;
}

const props = withDefaults(defineProps<Props>(), { size: "sm", rounded: false, showTooltip: true, showDelete: false });
const avatar = ref();
const initials = ref("");

const calculateAvatarColor = (): string => {
    const charCodeRed = initials.value.charCodeAt(0);
    const charCodeGreen = initials.value.charCodeAt(1) || charCodeRed;

    const red = Math.pow(charCodeRed, 7) % 200;
    const green = Math.pow(charCodeGreen, 7) % 200;
    const blue = (red + green) % 200;
    return `rgb(${red},${green},${blue})`;
};

onBeforeMount(() => {
    const spl = props.user.name && props.user.name.length > 0 ? props.user.name.split(" ") : props.user.username.split(" ");
    initials.value = spl.length >= 2 ? spl[0][0].toUpperCase() + spl[1][0].toUpperCase() : spl[0][0].toUpperCase();
})


</script>
