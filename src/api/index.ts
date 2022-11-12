import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import store from "@/store";
import router from "@/router";
import { Cookies } from 'quasar';

import { ValidationError } from "./exceptions";
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

API.interceptors.response.use((response: AxiosResponse) => {
    return response;
}, (error) => {
    if (error.response.status === 401 && !error.request.responseURL.includes("/auth/login")) {
        store.commit.auth.setLoggedIn(false);
        store.commit.auth.setUser(null);
        router.push({ name: "login" });
    }
    else if (error.response) {
        switch (error.response.status) {
            case 400:
                return Promise.reject(new ValidationError({ message: error.response.data.message, errors: error.response.data.errors }));
            case 500:
                router.replace({
                    name: "500",
                    query: {
                        traceback: error.response.data.traceback,
                    },
                });
                break;
        }
    }
    return Promise.reject(error);
});
