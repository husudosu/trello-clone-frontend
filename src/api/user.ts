import { API } from ".";
import { UserLogin, RegisterPayload, User } from "./types";

export const UserAPI = {
    login: (loginPayload: UserLogin) => {
        return API.post("/auth/login", loginPayload);
    },
    logout: () => {
        return API.post("/auth/logout");
    },
    getClaims: async () => {
        const { data } = await API.get("/auth/me");
        return data;
    },
    getUser: async (userId: number): Promise<User> => {
        const { data } = await API.get<User>(`/auth/users/${userId}`);
        return data;
    },
    register: async (payload: RegisterPayload) => {
        const { data } = await API.post("/auth/register", payload);
        return data;
    },
    findUser: async (username: string): Promise<User> => {
        const { data } = await API.post<User>("/auth/find-user", { username });
        return data;
    }
};