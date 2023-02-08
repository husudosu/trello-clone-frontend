import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import router from "@/router";
import { Cookies } from 'quasar';

import { ValidationError } from "./exceptions";
import { Notify } from 'quasar';
import * as DOMPurify from 'dompurify';
import { useAuthStore } from "@/stores/auth";

const config: AxiosRequestConfig = {
    withCredentials: true,
    baseURL: process.env.NODE_ENV === "development" ? `${window.location.protocol}//${window.location.hostname}:${process.env.VUE_APP_BACKEND_PORT || 5000}/api/v1` : window.location.protocol + "//" + window.location.host + "/api/v1",
    timeout: 10000,
    headers: {
        "Content-Type": "application/json",
    },

};
export const API: AxiosInstance = axios.create(config);

// TODO: Handle refresh-token

API.interceptors.request.use((config: AxiosRequestConfig) => {
    switch (config.method) {
        case "post":
        case "patch":
        case "delete":
            if (config.headers)
                config.headers["X-CSRF-TOKEN-ACCESS"] = Cookies.get("csrf_access_token");
            break;
    }
    return config;
}, (err) => {
    return Promise.reject(err);
});

// eslint-disable-next-line no-useless-escape
const IGNORE_404 = new RegExp('\/auth\/find-user|\/board\/[0-9]+\/find-member');

const handleHTTPExc = (err: any) => {
    if (err.response.status === 400) {
        if (err.response.data.errors) {
            const validationErr = new ValidationError({ message: err.response.data.message, errors: err.response.data.errors });
            Notify.create({
                position: "bottom-right",
                type: "negative",
                message: DOMPurify.sanitize(`Server validation error: ${validationErr.formatErrors()}`),
                html: true
            });
            return Promise.reject(validationErr);
        }
        else if (err.response.data.message) {
            Notify.create({
                position: "bottom-right",
                type: "negative",
                message: err.response.data.message,
            });
            return Promise.reject(err.response.data.message);
        }
        else {
            return Promise.reject(err.toJSON());
        }
    }
    else if (err.response.status === 404) {
        if (!IGNORE_404.test(err.config.url)) {
            Notify.create({
                position: "bottom-right",
                type: "negative",
                message: err.response.data.message
            });
        }
    }
    else if (err.response.status === 500) {
        router.push({
            name: "500",
            query: {
                traceback: err.response.data.traceback,
            },
        });
    }
    else if (err.response.status === 413) {
        Notify.create({
            position: "bottom-right",
            type: "negative",
            message: "The file you trying to upload is too large!"
        });
    }
    else if (err.response.status === 403) {
        Notify.create({
            position: "bottom-right",
            type: "negative",
            message: "You don't have permission to edit this entity!",
        });
    }
};

API.interceptors.response.use((response: AxiosResponse) => {
    return response;
}, (error) => {
    if (error.response.status === 401 && !error.request.responseURL.includes("/auth/login")) {
        const authStore = useAuthStore();
        authStore.setLoggedIn(false);
        authStore.setUser(null);
        router.push({ name: "login" });
    }
    else if (error.response)
        handleHTTPExc(error);

    return Promise.reject(error);
});
