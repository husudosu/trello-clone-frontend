<template>
    <div class="q-mt-lg q-ma-sm shadow-1">

        <q-item>
            <user-avatar size="lg" :user="user" :show-tooltip="false"></user-avatar>
        </q-item>
        <q-item>
            <q-item-section>
                <q-item-label>Name</q-item-label>
                <q-item-label caption lines="1">{{ user?.name }} ({{ user?.username }})</q-item-label>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-item-label>Roles</q-item-label>
                <q-item-label caption lines="1">{{ user?.roles.toString() }}</q-item-label>
            </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
                <q-item-label>Register date</q-item-label>
                <q-item-label caption lines="1">{{ user?.registered_date }}</q-item-label>
            </q-item-section>
        </q-item>

        <q-card-actions v-if="currentUser?.id === user?.id || currentUser?.roles.includes('admin')">
            <q-btn color="primary" :to="{ name: 'user.edit', params: { userId: user?.id } }">Edit</q-btn>
        </q-card-actions>

    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import store from '@/store';

import { User } from "@/api/types";
import { UserAPI } from "@/api/user";
import UserAvatar from "@/components/UserAvatar.vue";
const route = useRoute();

const user = ref<User>();
const currentUser = ref(store.state.auth.user);

const loadUser = async () => {
    if (typeof route.params.userId === 'string') {
        user.value = await UserAPI.getUser(parseInt(route.params.userId));
    }
};

loadUser();

</script>