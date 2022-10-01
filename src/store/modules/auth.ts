import { ActionContext } from "vuex";
import { State } from "../index";

import { UserAPI } from "@/api/user";
import { User, UserLogin } from "@/api/types";

export interface AuthState {
    user: null | User;
    loggedIn: boolean;
}

type Context = ActionContext<AuthState, State>;

export default {
    namespaced: true as const,
    state: {
        user: null,
        loggedIn: localStorage.getItem("loggedIn") == "true" ? true : false,
    } as AuthState,
    getters: {},
    mutations: {
        setUser(state: AuthState, user: User | null) {
            state.user = user;
        },
        setLoggedIn(state: AuthState, value: boolean) {
            localStorage.setItem("loggedIn", value.toString());
            state.loggedIn = value;
        },
    },
    actions: {
        async doLogin(context: Context, payload: UserLogin) {
            await UserAPI.login(payload);
            await context.dispatch("getUserClaims");
            context.commit("setLoggedIn", true);
            // Load accesable boards.
            context.dispatch("board/loadBoards", {}, { root: true });
        },
        async doLogout(context: Context) {
            await UserAPI.logout();
            context.commit("setLoggedIn", false);
            context.commit("setUser", null);
        },
        async getUserClaims(context: Context) {
            const data = await UserAPI.getClaims();
            context.commit("setLoggedIn", true);
            context.commit("setUser", data);
        }
    },

};