import { UserAPI } from "./api/user";
import moment from "moment-timezone";

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
export const validateDate = (val: string): Promise<string | boolean> => {
    return new Promise((resolve) => {
        resolve(
            moment(val, "YYYY-MM-DD").isValid() ? true : "Not valid date!"
        );
    });
};
export const validateDateTime = (val: string): Promise<string | boolean> => {
    return new Promise((resolve) => {
        resolve(
            moment(val, "YYYY-MM-DD HH:mm").isValid() ? true : "Not valid datetime!"
        );
    });
};