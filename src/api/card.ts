import moment from "moment-timezone";

import { API } from ".";
import { Card, CardActivity, CardActivityQueryParams, CardComment, CardDate, CardMember, DraftCard, DraftCardDate, DraftCardMember, PaginatedCardActivity } from "./types";
import store from "@/store";
import { ChecklistAPI } from "./checklist";

export interface MoveCardParams {
    list_id: number;
    position: number;
}

export const CardAPI = {
    parseCardDate: (data: CardDate) => {
        if (data.dt_from) {
            data.dt_from = moment.utc(data.dt_from).tz(store.getters.auth.timezone);
        }
        data.dt_to = moment.utc(data.dt_to).tz(store.getters.auth.timezone);
        return data;
    },
    parseCardComment: (data: CardComment) => {
        data.created = moment.utc(data.created).tz(store.getters.auth.timezone);
        data.updated = moment.utc(data.updated).tz(store.getters.auth.timezone);
        return data;
    },
    parseCardActivity: (data: CardActivity) => {
        data.activity_on = moment.utc(data.activity_on).tz(store.getters.auth.timezone);
        if (data.comment) {
            CardAPI.parseCardComment(data.comment);
        }
        if (data.changes)
            data.changes = JSON.parse(data.changes);
        return data;
    },
    /*
    Parses card, for example converts dates into moment object.
    */
    parseCard: (data: Card): Card => {
        data.dates.forEach((dt) => {
            if (dt.dt_from) {
                dt.dt_from = moment.utc(dt.dt_from).tz(store.getters.auth.timezone);
            }
            dt.dt_to = moment.utc(dt.dt_to).tz(store.getters.auth.timezone);
        });
        data.checklists.forEach((checklist) => {
            checklist.items.forEach((item) => {
                // Parse checklist items
                ChecklistAPI.parseChecklistItem(item);
            });
        });
        data.activities.forEach((activity) => {
            CardAPI.parseCardActivity(activity);
        });
        return data;
    },
    getCard: async (cardId: number): Promise<Card> => {
        const { data } = await API.get<Card>(`/card/${cardId}`);
        return CardAPI.parseCard(data);
    },
    postCard: async (boardListId: number, card: DraftCard) => {
        const { data } = await API.post<Card>(`/list/${boardListId}/card`, card);
        return CardAPI.parseCard(data);
    },
    patchCard: async (cardId: number, updatedCard: Partial<Card>) => {
        const { data } = await API.patch<Card>(`/card/${cardId}`, updatedCard);
        return CardAPI.parseCard(data);
    },
    moveCard: async (cardId: number, params: MoveCardParams) => {
        const { data } = await API.patch<Card>(`/card/${cardId}`, params);
        return CardAPI.parseCard(data);
    },
    deleteCard: async (cardId: number) => {
        await API.delete(`/card/${cardId}`);
    },
    postCardComment: async (cardId: number, comment: Partial<CardComment>): Promise<CardActivity> => {
        const { data } = await API.post<CardActivity>(`/card/${cardId}/comment`, comment);
        data.activity_on = moment.utc(data.activity_on).tz(store.getters.auth.timezone);
        if (data.comment) {
            data.comment = CardAPI.parseCardComment(data.comment);
        }
        return data;
    },
    getCardActivities: async (cardId: number, params: CardActivityQueryParams) => {
        const { data } = await API.get<PaginatedCardActivity>(`/card/${cardId}/activities`, { params });
        data.data.forEach((el) => {
            CardAPI.parseCardActivity(el);
        });
        return data;
    },
    assignCardMember: async (cardId: number, member: DraftCardMember): Promise<CardMember> => {
        const { data } = await API.post<CardMember>(`/card/${cardId}/assign-member`, member);
        return data;
    },
    deassignCardMember: async (cardId: number, boardUserId: number) => {
        console.log(cardId);
        console.log(boardUserId);
        const { data } = await API.post<CardMember>(`/card/${cardId}/deassign-member`, { board_user_id: boardUserId });
        return data;
    },
    postCardDate: async (cardId: number, dt: DraftCardDate): Promise<CardDate> => {
        // Convert date to UTC before pushing to API
        dt.dt_to = moment.tz(dt.dt_to, store.getters.auth.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        if (dt.dt_from) {
            dt.dt_from = moment.tz(dt.dt_from, store.getters.auth.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }

        const { data } = await API.post<CardDate>(`/card/${cardId}/date`, dt);
        return CardAPI.parseCardDate(data);
    },
    patchCardDate: async (cardDateId: number, dt: CardDate): Promise<CardDate> => {

        // Make clone of dt before conversion
        const cdt = { ...dt };

        // Convert date to UTC before pushing to API
        cdt.dt_to = moment.tz(cdt.dt_to, store.getters.auth.timezone).utc();
        if (cdt.dt_from) {
            cdt.dt_from = moment.tz(cdt.dt_from, store.getters.auth.timezone).utc();
        }

        const { data } = await API.patch<CardDate>(`/date/${cardDateId}`, cdt);
        return CardAPI.parseCardDate(data);
    },
    deleteCardDate: async (cardDateId: number) => {
        await API.delete(`/date/${cardDateId}`);
    }
};