import { API } from ".";
import { IUserLogin, IRegisterPayload, IUser, IUserUpdate } from "./types";

export const UserAPI = {
    login: (loginPayload: IUserLogin) => {
        return API.post("/auth/login", loginPayload);
    },
    logout: () => {
        return API.post("/auth/logout");
    },
    getClaims: async () => {
        const { data } = await API.get("/auth/users/me");
        return data;
    },
    getUser: async (userId: number): Promise<IUser> => {
        const { data } = await API.get<IUser>(`/auth/users/${userId}`);
        return data;
    },
    register: async (payload: IRegisterPayload) => {
        const { data } = await API.post("/auth/register", payload);
        return data;
    },
    findUser: async (username: string): Promise<IUser> => {
        const { data } = await API.post<IUser>("/auth/find-user", { username });
        return data;
    },
    updateUser: async (userId: number, user: IUserUpdate): Promise<IUser> => {
        const { data } = await API.patch<IUser>(`/auth/users/${userId}`, user);
        return data;
    }
};