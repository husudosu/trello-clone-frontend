import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import store from "@/store";
import router from "@/router";
import { Cookies } from 'quasar';

import { ValidationError } from "./exceptions";
import { Notify } from 'quasar';
import * as DOMPurify from 'dompurify';

const config: AxiosRequestConfig = {
    withCredentials: true,
    baseURL: process.env.NODE_ENV === "development" ? process.env.VUE_APP_API_BASEURL : window.location.protocol + "//" + window.location.host + "/api/v1",
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

// TODO: Ignore 404 on find-member request
const handleHTTPExc = (err: any) => {
    if (err.response.status === 400) {
        const validationErr = new ValidationError({ message: err.response.data.message, errors: err.response.data.errors });
        Notify.create({
            position: "bottom-right",
            type: "negative",
            message: DOMPurify.sanitize(`Server validation error: ${validationErr.formatErrors()}`),
            html: true
        });
        return Promise.reject(validationErr);
    }
    else if (err.response.status === 404) {
        Notify.create({
            position: "bottom-right",
            type: "negative",
            message: err.response.data.message
        });
    }
    else if (err.response.status === 500) {
        router.replace({
            name: "500",
            query: {
                traceback: err.response.data.traceback,
            },
        });
    }
};

API.interceptors.response.use((response: AxiosResponse) => {
    return response;
}, (error) => {
    if (error.response.status === 401 && !error.request.responseURL.includes("/auth/login")) {
        store.commit.auth.setLoggedIn(false);
        store.commit.auth.setUser(null);
        router.push({ name: "login" });
    }
    else if (error.response)
        handleHTTPExc(error);

    return Promise.reject(error);
});
