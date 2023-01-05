import { defineStore } from "pinia";

import { UserAPI } from "@/api/user";
import { User, UserLogin } from "@/api/types";
import { useBoardStore } from "./board";

export interface State {
    user: null | User;
    loggedIn: boolean;
}


export const useAuthStore = defineStore('auth', {
    state: (): State => ({
        user: null,
        loggedIn: false
    }),
    getters: {
        timezone: (state: State) => {
            return state.user ? state.user.timezone : "UTC";
        },
    },
    actions: {
        setUser(user: User | null) {
            this.user = user;
        },
        setLoggedIn(value: boolean) {
            localStorage.setItem("loggedIn", value.toString());
            this.loggedIn = value;
        },
        async doLogin(payload: UserLogin) {
            await UserAPI.login(payload);
            await this.getUserClaims();
            this.setLoggedIn(true);

            // Load accesable boards.
            const boardStore = useBoardStore();
            await boardStore.loadBoards();
            // context.dispatch("board/loadBoards", {}, { root: true });
        },
        async doLogout() {
            await UserAPI.logout();
            this.setLoggedIn(false);
            this.setUser(null);
        },
        async getUserClaims() {
            this.setLoggedIn(true);
            this.setUser(await UserAPI.getClaims());
        }
    }
});