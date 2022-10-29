import moment from "moment-timezone";

import { API } from ".";
import { CardChecklist, ChecklistItem, DraftChecklistItem } from "./types";
import store from "@/store";

export const ChecklistAPI = {
    postCardChecklist: async (cardId: number, checklist: Partial<CardChecklist>): Promise<CardChecklist> => {
        const { data } = await API.post<CardChecklist>(`/card/${cardId}/checklist`, checklist);
        return data;
    },
    patchCardChecklist: async (checklistId: number, checklist: CardChecklist): Promise<CardChecklist> => {
        const { data } = await API.patch<CardChecklist>(`/checklist/${checklistId}`, checklist);
        return data;
    },
    deleteCardchecklist: async (checklistId: number) => {
        await API.delete(`/checklist/${checklistId}`);
        return {};
    },
    postChecklistItem: async (checklistId: number, item: DraftChecklistItem): Promise<ChecklistItem> => {
        const { data } = await API.post<ChecklistItem>(`/checklist/${checklistId}/item`, item);
        if (data.marked_complete_on) {
            data.marked_complete_on = moment.utc(data.marked_complete_on).tz(store.getters.auth.timezone);
        }
        return data;
    },
    patchChecklistItem: async (itemId: number, item: ChecklistItem): Promise<ChecklistItem> => {
        const { data } = await API.patch<ChecklistItem>(`/checklist/item/${itemId}`, item);
        if (data.marked_complete_on) {
            data.marked_complete_on = moment.utc(data.marked_complete_on).tz(store.getters.auth.timezone);
        }
        return data;
    },
    deleteChecklistItem: async (itemId: number) => {
        await API.delete(`/checklist/item/${itemId}`);
    },
    markChecklistItem: async (itemId: number, completed: boolean): Promise<ChecklistItem> => {
        const { data } = await API.patch<ChecklistItem>(`/checklist/item/${itemId}`, { completed });
        if (data.marked_complete_on) {
            data.marked_complete_on = moment.utc(data.marked_complete_on).tz(store.getters.auth.timezone);
        }
        return data;
    },
    updateItemsOrder: async (checklist: CardChecklist) => {
        const orderData = checklist.items.map((el) => el.id);
        await API.patch(`/checklist/${checklist.id}/items-order`, orderData);
    }
};