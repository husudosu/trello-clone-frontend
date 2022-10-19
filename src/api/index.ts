import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import store from "@/store";
import router from "@/router";
import { Cookies } from 'quasar';

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
API.defaults.headers.post["X-CSRF-TOKEN-ACCESS"] = Cookies.get("csrf_access_token");
API.defaults.headers.patch["X-CSRF-TOKEN-ACCESS"] = Cookies.get("csrf_access_token");
API.defaults.headers.delete["X-CSRF-TOKEN-ACCESS"] = Cookies.get("csrf_access_token");


API.interceptors.response.use((response: AxiosResponse) => {
    return response;
}, (error) => {
    if (error.response.status === 401 && !error.request.responseURL.includes("/auth/login")) {
        store.commit.auth.setLoggedIn(false);
        store.commit.auth.setUser(null);
        router.push({ name: "login" });
    }
    else if (error.response.status === 500) {
        router.replace({
            name: "500",
            query: {
                traceback: error.response.data.traceback,
            },
        });
    }
    return Promise.reject(error);
});
