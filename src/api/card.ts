import moment from "moment-timezone";

import { API } from ".";
import { Card, CardActivity, CardComment } from "./types";
import store from "@/store";
export interface MoveCardParams {
    list_id: number;
    position: number;
}


export const getCard = async (cardId: number) => {
    const { data } = await API.get<Card>(`/card/${cardId}`);
    return data;
};

export const postCardComment = async (cardId: number, comment: Partial<CardComment>) => {
    const { data } = await API.post<CardActivity>(`/card/${cardId}/comment`, comment);

    // FIXME: Probably it's a bad thing to convert dates here to moment, need better solution!
    data.activity_on = moment.utc(data.activity_on).tz(store.state.auth.user?.timezone || "N/A");
    if (data.comment) {
        data.comment.created = moment.utc(data.comment.created).tz(store.state.auth.user?.timezone || "N/A");
        data.comment.updated = moment.utc(data.comment.updated).tz(store.state.auth.user?.timezone || "N/A");
    }
    return data;
};

export const postCard = async (boardListId: number, card: Card) => {
    const { data } = await API.post<Card>(`/list/${boardListId}/card`, card);
    return data;
};

export const patchCard = async (cardId: number, updatedCard: Partial<Card>) => {
    const { data } = await API.patch<Card>(`/card/${cardId}`, updatedCard);
    return data;
};

export const moveCard = async (cardId: number, params: MoveCardParams) => {
    const { data } = await API.patch<Card>(`/card/${cardId}`, params);
    return data;
};

export const getCardActivities = async (cardId: number) => {
    const { data } = await API.get<CardActivity[]>(`/card/${cardId}/activities`);

    // FIXME: Probably it's a bad thing to convert dates here to moment, need better solution!
    data.forEach((el) => {
        el.activity_on = moment.utc(el.activity_on).tz(store.state.auth.user?.timezone || "N/A");
        if (el.comment) {
            el.comment.created = moment.utc(el.comment.created).tz(store.state.auth.user?.timezone || "N/A");
            el.comment.updated = moment.utc(el.comment.updated).tz(store.state.auth.user?.timezone || "N/A");
        }
    });
    return data;
};

export const deleteCard = async (cardId: number) => {
    await API.delete(`/card/${cardId}`);
};