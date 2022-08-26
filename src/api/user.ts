import { API } from ".";
import { UserLogin, RegisterPayload, User } from "./types";

export const login = async (loginPayload: UserLogin) => {
    const { data } = await API.post("/auth/login", loginPayload);
    return data;
};

export const logout = async () => {
    const { data } = await API.post("/auth/logout");
    return data;
};

export const getClaims = async () => {
    const { data } = await API.get("/auth/me");
    return data;
};

export const getUser = async (userId: number) => {
    const { data } = await API.get<User>(`/auth/users/${userId}`);
    return data;
};

export const register = async (payload: RegisterPayload) => {
    const { data } = await API.post("/auth/register", payload);
    return data;
};

export const findUser = async (username: string) => {
    const { data } = await API.post<User>("/auth/find-user", { username });
    return data;
};