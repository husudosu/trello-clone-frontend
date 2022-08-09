<template>
    <q-page class="window-height window-width row justify-center items-center">
        <div class="column q-pa-lg">
            <div class="row">
                <q-card square class="shadow-1" style="width:400px;">
                    <q-card-section class="bg-primary">
                        <h4 class="text-h5 text-white q-my-md">Registration</h4>
                    </q-card-section>
                    <q-card-section v-if="Object.keys(validationErrors).length > 0" style="line-heigt: normal">
                        Validation errors:
                        <ul v-for="(fieldErrors, index) in validationErrors" :key="index">
                            <li>{{ index }}</li>
                            <ul>
                                <li v-for="(message, index) in fieldErrors" :key="index">
                                    {{ message }}
                                </li>
                            </ul>
                        </ul>
                    </q-card-section>
                    <q-card-section>
                        <q-form class="q-px-sm q-pt-none q-pb-xs">
                            <q-input square v-model="reg.email" type="email" label="Email">
                                <template v-slot:prepend>
                                    <q-icon name="email" />
                                </template>
                            </q-input>
                            <q-input square v-model="reg.username" type="text" label="Username">
                                <template v-slot:prepend>
                                    <q-icon name="person" />
                                </template>
                            </q-input>
                            <q-input square v-model="reg.password" type="password" label="Password">
                                <template v-slot:prepend>
                                    <q-icon name="lock" />
                                </template>
                            </q-input>
                            <q-input square v-model="reg.name" type="text" label="Name">
                                <template v-slot:prepend>
                                    <q-icon name="person" />
                                </template>
                            </q-input>
                            <q-select v-model="reg.timezone" use-input input-debounce="0" label="Timezone"
                                :options="timezones" @filter="filterFn">
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
                        </q-form>
                    </q-card-section>
                    <q-card-actions class="q-px-lg">
                        <q-btn unelevated size="lg" color="primary" class="full-width text-white" label="Register"
                            style="margin-bottom: 10px;" @click="onRegisterClicked" />
                    </q-card-actions>
                </q-card>
            </div>
        </div>
    </q-page>
</template>

<script lang="ts" setup>
import { RegisterPayload } from "@/api/types";
import { register } from "@/api/user";
import { ref } from "vue";
import { useRouter } from "vue-router";

import timezonesData from "../json/timezones.json";

const router = useRouter();

const timezones = ref(timezonesData);

const validationErrors = ref({});

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
const reg = ref<RegisterPayload>({
    email: "",
    username: "",
    password: "",
    timezone: "",
    name: ""
});

const onRegisterClicked = async () => {
    try {
        validationErrors.value = {};
        await register(reg.value);
        router.push({ name: "login" });
    }
    catch (err: any) {
        if (err.response.data.message === "validation_error") {
            validationErrors.value = err.response.data.errors;
            console.log(err.response.data.errors);
        }
    }
};

</script>
