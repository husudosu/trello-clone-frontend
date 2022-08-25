import { getClaims, login, logout } from "@/api/user";
import { User, UserLogin } from "@/api/types";

type InitialState = {
    user: null | User;
    loggedIn: boolean;
};

export default {
    namespaced: true as const,
    state: {
        user: null,
        loggedIn: false
    } as InitialState,
    getters: {},
    mutations: {
        setUser(state: InitialState, user: User | null) {
            state.user = user;
        },
        setLoggedIn(state: InitialState, value: boolean) {
            state.loggedIn = value;
        },
    },
    actions: {
        async doLogin({ commit, dispatch }: any, payload: UserLogin) {
            await login(payload);
            // commit("setUser", jwt_decode(data.access_token));
            await dispatch("getUserClaims");
            commit("setLoggedIn", true);
            // Load accesable boards.
            dispatch("board/loadBoards", {}, { root: true });
        },
        async doLogout({ commit }: any) {
            await logout();
            commit("setLoggedIn", false);
            commit("setUser", null);
        },
        async getUserClaims({ commit }: any) {
            const data = await getClaims();
            commit("setLoggedIn", true);
            commit("setUser", data);
        }
    },

};