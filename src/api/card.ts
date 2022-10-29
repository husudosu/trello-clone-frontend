import moment from "moment-timezone";

import { API } from ".";
import { Card, CardActivity, CardActivityQueryParams, CardComment, CardDate, CardMember, DraftCard, DraftCardDate, DraftCardMember, PaginatedCardActivity } from "./types";
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

        data.dates.forEach((dt) => {
            if (dt.dt_from) {
                dt.dt_from = moment.utc(dt.dt_from).tz(store.state.auth.user?.timezone || "UTC");
            }
            dt.dt_to = moment.utc(dt.dt_to).tz(store.state.auth.user?.timezone || "UTC");
        });
        return data;
    },
    postCard: async (boardListId: number, card: DraftCard) => {
        const { data } = await API.post<Card>(`/list/${boardListId}/card`, card);
        return data;
    },
    patchCard: async (cardId: number, updatedCard: Partial<Card>) => {
        const { data } = await API.patch<Card>(`/card/${cardId}`, updatedCard);
        data.dates.forEach((dt) => {
            if (dt.dt_from) {
                dt.dt_from = moment.utc(dt.dt_from).tz(store.state.auth.user?.timezone || "UTC");
            }
            dt.dt_to = moment.utc(dt.dt_to).tz(store.state.auth.user?.timezone || "UTC");
        });
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
    assignCardMember: async (cardId: number, member: DraftCardMember): Promise<CardMember> => {
        const { data } = await API.post<CardMember>(`/card/${cardId}/assign-member`, member);
        return data;
    },
    deassignCardMember: async (cardId: number, boardUserId: number) => {
        await API.post<CardMember>(`/card/${cardId}/deassign-member`, { board_user_id: boardUserId });
    },
    postCardDate: async (cardId: number, dt: DraftCardDate): Promise<CardDate> => {
        // Convert date to UTC before pushing to API
        dt.dt_to = moment.tz(dt.dt_to, store.state.auth.user?.timezone || "UTC").utc().format("YYYY-MM-DD HH:mm:ss");
        if (dt.dt_from) {
            dt.dt_from = moment.tz(dt.dt_from, store.state.auth.user?.timezone || "UTC").utc().format("YYYY-MM-DD HH:mm:ss");
        }

        const { data } = await API.post<CardDate>(`/card/${cardId}/date`, dt);

        if (data.dt_from) {
            data.dt_from = moment.utc(dt.dt_from).tz(store.state.auth.user?.timezone || "UTC");
        }
        data.dt_to = moment.utc(dt.dt_to).tz(store.state.auth.user?.timezone || "UTC");
        return data;
    },
    patchCardDate: async (cardDateId: number, dt: CardDate): Promise<CardDate> => {
        // Convert date to UTC before pushing to API
        dt.dt_to = moment.tz(dt.dt_to, store.state.auth.user?.timezone || "UTC").utc();
        if (dt.dt_from) {
            dt.dt_from = moment.tz(dt.dt_from, store.state.auth.user?.timezone || "UTC").utc();
        }

        const { data } = await API.patch<CardDate>(`/date/${cardDateId}`, dt);
        if (data.dt_from) {
            data.dt_from = moment.utc(data.dt_from).tz(store.state.auth.user?.timezone || "UTC");
        }
        data.dt_to = moment.utc(data.dt_to).tz(store.state.auth.user?.timezone || "UTC");
        return data;
    },
    deleteCardDate: async (cardDateId: number) => {
        await API.delete(`/date/${cardDateId}`);
    }
};