<template>
    <q-layout>
        <q-page-container>
            <q-page class="window-height window-width row justify-center items-center">
                <div class="column">
                    <div class="row">
                        <h5 class="text-h5 q-my-md">Yamakanban</h5>
                    </div>
                    <div class="row">
                        <q-card square bordered class="q-pa-lg shadow-1">
                            <q-card-section v-if="failedMessage.length > 0">
                                {{ failedMessage }}
                            </q-card-section>
                            <q-card-section>
                                <q-form class="q-gutter-md">
                                    <q-input square filled v-model="loginPayload.username" type="email" label="Username"
                                        autofocus />
                                    <q-input square filled v-model="loginPayload.password" type="password"
                                        label="Password" @keyup.enter="onLoginClicked" />
                                </q-form>
                            </q-card-section>
                            <q-card-actions class="q-px-md">
                                <q-btn color="primary" unelevated size="lg" class="full-width" label="Login"
                                    @click="onLoginClicked" />
                            </q-card-actions>
                            <q-card-section class="text-center q-pa-none">
                                <router-link :to="{ name: 'register' }" class="text-grey-6">Create an
                                    account</router-link>
                            </q-card-section>
                        </q-card>
                    </div>
                </div>
            </q-page>
        </q-page-container>
    </q-layout>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { IUserLogin } from '@/api/types.js';
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();
const loginPayload = ref<IUserLogin>({ username: "", password: "" });
const failedMessage = ref<string>("");

const onLoginClicked = () => {
    failedMessage.value = "";
    authStore.doLogin(loginPayload.value).then(
        () => {
            router.push({ name: "dashboard" });
        }
    ).catch((err) => {
        console.log(err);
        if (err.response.data) {
            failedMessage.value = err.response.data.message;
        }
    });

};
</script>

<style>
.q-card {
    width: 360px;
}
</style>