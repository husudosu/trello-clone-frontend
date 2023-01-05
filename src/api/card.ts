import moment from "moment-timezone";

import { API } from ".";
import { Card, CardActivity, CardActivityQueryParams, CardComment, CardDate, CardMember, DraftCard, DraftCardDate, DraftCardMember, PaginatedCardActivity } from "./types";
import { ChecklistAPI } from "./checklist";
import { useAuthStore } from "@/stores/auth";

export interface MoveCardParams {
    list_id: number;
    position: number;
}

export const CardAPI = {
    parseCardDate: (data: CardDate) => {
        const authStore = useAuthStore();
        if (data.dt_from) {
            data.dt_from = moment.utc(data.dt_from).tz(authStore.timezone);
        }
        data.dt_to = moment.utc(data.dt_to).tz(authStore.timezone);
        return data;
    },
    parseCardComment: (data: CardComment) => {
        const authStore = useAuthStore();
        data.created = moment.utc(data.created).tz(authStore.timezone);
        data.updated = moment.utc(data.updated).tz(authStore.timezone);
        return data;
    },
    parseCardActivity: (data: CardActivity) => {
        const authStore = useAuthStore();
        data.activity_on = moment.utc(data.activity_on).tz(authStore.timezone);
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
        const authStore = useAuthStore();
        data.dates.forEach((dt) => {
            if (dt.dt_from) {
                dt.dt_from = moment.utc(dt.dt_from).tz(authStore.timezone);
            }
            dt.dt_to = moment.utc(dt.dt_to).tz(authStore.timezone);
        });

        if (data.archived_on) {
            data.archived_on = moment.utc(data.archived_on).tz(authStore.timezone);
        }
        data.checklists.forEach((checklist) => {
            checklist.items.forEach((item) => {
                // Parse checklist items
                ChecklistAPI.parseChecklistItem(item);
            });
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
        const authStore = useAuthStore();
        const { data } = await API.post<CardActivity>(`/card/${cardId}/comment`, comment);
        data.activity_on = moment.utc(data.activity_on).tz(authStore.timezone);
        if (data.comment) {
            data.comment = CardAPI.parseCardComment(data.comment);
        }
        return data;
    },
    patchCardComment: async (commentId: number, comment: Partial<CardComment>): Promise<CardComment> => {
        const { data } = await API.patch<CardComment>(`comment/${commentId}`, comment);
        return data;
    },
    getCardActivities: async (cardId: number, params: CardActivityQueryParams) => {
        const authStore = useAuthStore();
        if (params.dt_to) {
            params.dt_to = moment.tz(params.dt_to, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        if (params.dt_from) {
            params.dt_from = moment.tz(params.dt_from, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }

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
        const { data } = await API.post<CardMember>(`/card/${cardId}/deassign-member`, { board_user_id: boardUserId });
        return data;
    },
    postCardDate: async (cardId: number, dt: DraftCardDate): Promise<CardDate> => {
        const authStore = useAuthStore();
        // Convert date to UTC before pushing to API
        dt.dt_to = moment.tz(dt.dt_to, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        if (dt.dt_from) {
            dt.dt_from = moment.tz(dt.dt_from, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }

        const { data } = await API.post<CardDate>(`/card/${cardId}/date`, dt);
        return CardAPI.parseCardDate(data);
    },
    patchCardDate: async (cardDateId: number, dt: Partial<CardDate>): Promise<CardDate> => {
        // Make clone of dt before conversion
        const authStore = useAuthStore();
        const cdt: any = { ...dt };

        // Convert dates to UTC before pushing to API
        if (cdt.dt_to) {
            cdt.dt_to = moment.tz(cdt.dt_to, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        if (cdt.dt_from) {
            cdt.dt_from = moment.tz(cdt.dt_from, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        const { data } = await API.patch<CardDate>(`/date/${cardDateId}`, cdt);
        return CardAPI.parseCardDate(data);
    },
    deleteCardDate: async (cardDateId: number) => {
        await API.delete(`/date/${cardDateId}`);
    },
    deleteComment: async (commentId: number) => {
        await API.delete(`/comment/${commentId}`);
    }
};