import { UserAPI } from "./api/user";

export const requiredTextField = (val: string) => val && val.length > 0 || "Field required!";
export const validateUser = (val: string): Promise<string | boolean> => {
    return new Promise((resolve) => {
        UserAPI.findUser(val).then(() => {
            resolve("User already exists!");
        }).catch(() => {
            resolve(true);
        });
    });
};