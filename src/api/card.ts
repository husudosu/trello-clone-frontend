import moment from "moment-timezone";

import { API } from ".";
import { Card, CardActivity, CardActivityQueryParams, CardComment, DraftCard, PaginatedCardActivity } from "./types";
import store from "@/store";
export interface MoveCardParams {
    list_id: number;
    position: number;
}

export const CardAPI = {
    getCard: async (cardId: number): Promise<Card> => {
        const { data } = await API.get<Card>(`/card/${cardId}`);

        // FIXME: Do not process checklist item dates here.
        data.checklists?.forEach((checklist) => {
            checklist.items.forEach((item) => {
                if (item.marked_complete_on) {
                    item.marked_complete_on = moment.utc(item.marked_complete_on).tz(store.state.auth.user?.timezone || "UTC");
                }
            });
        });
        return data;
    },
    postCard: async (boardListId: number, card: DraftCard) => {
        const { data } = await API.post<Card>(`/list/${boardListId}/card`, card);
        return data;
    },
    patchCard: async (cardId: number, updatedCard: Partial<Card>) => {
        const { data } = await API.patch<Card>(`/card/${cardId}`, updatedCard);
        return data;
    },
    moveCard: async (cardId: number, params: MoveCardParams) => {
        const { data } = await API.patch<Card>(`/card/${cardId}`, params);
        return data;
    },
    deleteCard: async (cardId: number) => {
        await API.delete(`/card/${cardId}`);
    },
    postCardComment: async (cardId: number, comment: Partial<CardComment>): Promise<CardActivity> => {
        const { data } = await API.post<CardActivity>(`/card/${cardId}/comment`, comment);
        // FIXME: Probably it's a bad thing to convert dates here to moment, need better solution!
        data.activity_on = moment.utc(data.activity_on).tz(store.state.auth.user?.timezone || "UTC");
        if (data.comment) {
            data.comment.created = moment.utc(data.comment.created).tz(store.state.auth.user?.timezone || "UTC");
            data.comment.updated = moment.utc(data.comment.updated).tz(store.state.auth.user?.timezone || "UTC");
        }
        return data;
    },
    getCardActivities: async (cardId: number, params: CardActivityQueryParams) => {
        const { data } = await API.get<PaginatedCardActivity>(`/card/${cardId}/activities`, { params });

        // FIXME: Probably it's a bad thing to convert dates here to moment, need better solution!
        data.data.forEach((el) => {
            el.activity_on = moment.utc(el.activity_on).tz(store.state.auth.user?.timezone || "UTC");
            if (el.comment) {
                el.comment.created = moment.utc(el.comment.created).tz(store.state.auth.user?.timezone || "UTC");
                el.comment.updated = moment.utc(el.comment.updated).tz(store.state.auth.user?.timezone || "UTC");
            }
            if (el.changes)
                el.changes = JSON.parse(el.changes);
        });
        return data;
    },
};