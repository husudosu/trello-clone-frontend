<template>
    <div class="q-ma-md">
        <div v-if="Object.keys(validationErrors).length > 0">
            Validation errors:
            <ul v-for="(fieldErrors, index) in validationErrors" :key="index">
                <li>{{ index }}</li>
                <ul>
                    <li v-for="(message, index) in fieldErrors" :key="index">
                        {{ message }}
                    </li>
                </ul>
            </ul>
        </div>
        <q-form ref="editForm" class="q-px-sm q-pt-none q-pb-xs" v-if="updateUser">
            <q-input square v-model="updateUser.email" type="email" label="Email"
                :rules="[requiredTextField, validateFormEmail]" debounce="300">
                <template v-slot:prepend>
                    <q-icon name="email" />
                </template>
            </q-input>
            <q-input square v-model="updateUser.username" type="text" label="Username"
                :rules="[requiredTextField, validateFormUsername]" debounce="300">
                <template v-slot:prepend>
                    <q-icon name="person" />
                </template>
            </q-input>
            <q-input square v-model="updateUser.name" type="text" label="Name">
                <template v-slot:prepend>
                    <q-icon name="person" />
                </template>
            </q-input>
            <q-select v-model="updateUser.timezone" use-input input-debounce="0" label="Timezone" :options="timezones"
                @filter="filterFn">
                <template v-slot:prepend>
                    <q-icon name="schedule" />
                </template>
                <template v-slot:no-option>
                    <q-item>
                        <q-item-section class="text-grey">
                            No results
                        </q-item-section>
                    </q-item>
                </template>
            </q-select>
            <q-input square v-model="updateUser.password" type="password" label="New password">
                <template v-slot:prepend>
                    <q-icon name="lock" />
                </template>
            </q-input>
            <q-input square v-model="updateUser.current_password" type="password" label="Current password"
                :rules="[requiredTextField]" v-if="!adminEdit">
                <template v-slot:prepend>
                    <q-icon name="lock" />
                </template>
            </q-input>

            <q-btn unelevated size="md" color="primary" class="full-width text-white q-ma-sm" label="Save"
                style="margin-bottom: 10px;" @click="onSubmit" />
        </q-form>
    </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useQuasar } from "quasar";
import timezonesData from "../json/timezones.json";
import { IUser, IUserUpdate } from "@/api/types";
import { UserAPI } from "@/api/user";
import { requiredTextField, validateUser } from "@/formValidators";
import { useAuthStore } from "@/stores/auth";
const timezones = ref(timezonesData);

const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();

const user = ref<IUser>();
const updateUser = ref<IUserUpdate>();
const $q = useQuasar();

const validationErrors = ref({});
const editForm = ref();
/*
If admin edits other user current_password field is not required!
*/
const adminEdit = ref(false);


const loadUser = async () => {
    if (typeof route.params.userId === 'string') {
        // Check role of current user.
        const userId = parseInt(route.params.userId);
        if (
            authStore.user &&
            (
                authStore.user.id == userId ||
                authStore.user.roles.includes("admin")
            )
        ) {
            adminEdit.value = authStore.user.roles.includes("admin") && authStore.user.id !== userId;
            user.value = await UserAPI.getUser(userId);
            updateUser.value = { ...user.value, current_password: null };
        }
        else {
            $q.notify({
                type: "negative",
                message: "You don't have permission to edit this user!",
                timeout: 3000,
                position: "top",
                closeBtn: true
            });
            router.push({ name: "user", params: { userId: route.params.userId } });
        }
    }
};

/* 
Custom validators for this form.
*/
const validateFormUsername = (val: string): Promise<string | boolean> => {
    return new Promise(resolve => {

        // If username/email same as the previous do not call API
        if (user.value?.username == updateUser.value?.username) {
            resolve(true);
        }
        else {
            validateUser(val).then((result) => {
                resolve(result);
            });
        }
    });
};

const validateFormEmail = (val: string): Promise<string | boolean> => {
    return new Promise(resolve => {

        // If username/email same as the previous do not call API
        if (user.value?.email == updateUser.value?.email) {
            resolve(true);
        }
        else {
            validateUser(val).then((result) => {
                resolve(result);
            });
        }
    });
};

const onSubmit = async () => {
    editForm.value.validate().then((success: boolean) => {
        validationErrors.value = {};
        if (success && updateUser.value) {
            UserAPI.updateUser(updateUser.value.id, updateUser.value)
                .then(async (data) => {
                    if (authStore.user?.id === updateUser.value?.id) {
                        await authStore.getUserClaims();
                    }
                    $q.notify({ type: "positive", message: "User updated", timeout: 3000, position: "top", closeBtn: true });
                    router.push({ name: "user", params: { userId: data.id } });
                })
                .catch((err) => {
                    if (err.response.data.message === "validation_error") {
                        validationErrors.value = err.response.data.errors;
                    }
                });
        }
    });
};

const filterFn = (val: string, update: any) => {
    if (val === '') {
        update(() => {
            timezones.value = timezonesData;
        });
        return;
    }

    update(() => {
        const needle = val.toLowerCase();
        timezones.value = timezonesData.filter((v: string) => v.toLowerCase().indexOf(needle) > -1);
    });
};
loadUser();
</script> 