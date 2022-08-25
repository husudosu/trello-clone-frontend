import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import store from "@/store";
import router from "@/router";
import { getCookie } from "@/cookie";

const config: AxiosRequestConfig = {
    withCredentials: true,
    baseURL: process.env.VUE_APP_API_BASEURL,
    timeout: 10000,
    xsrfCookieName: "csrf_access_token",
    headers: {
        "Content-Type": "application/json",
    },

};
export const API: AxiosInstance = axios.create(config);

// TODO: Handle refresh-token
API.interceptors.request.use((config: AxiosRequestConfig) => {
    const csrf_access_token: string | undefined = getCookie("csrf_access_token");
    if (config.headers === undefined)
        config.headers = {};
    if (csrf_access_token != null) {
        config.headers["X-CSRF-TOKEN-ACCESS"] = csrf_access_token;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

API.interceptors.response.use((response: AxiosResponse) => {
    return response;
}, (error) => {
    if (error.response.status === 401 && !error.request.responseURL.includes("/auth/login")) {
        store.commit.auth.setLoggedIn(false);
        store.commit.auth.setUser(null);
        router.push({ name: "login" });
    }
    else if (error.response.status === 500) {
        router.push({
            name: "500",
            query: {
                traceback: error.response.data.traceback,
            },
        });
    }
    return Promise.reject(error);
});
