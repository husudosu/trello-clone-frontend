import moment from "moment-timezone";

import { API } from ".";
import { CardChecklist, ChecklistItem } from "./types";

export const ChecklistAPI = {
    postCardChecklist: async (cardId: number, checklist: CardChecklist): Promise<CardChecklist> => {
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
    postChecklistItem: async (checklistId: number, item: ChecklistItem): Promise<ChecklistItem> => {
        const { data } = await API.post<ChecklistItem>(`/checklist/${checklistId}/item`, item);
        return data;
    },
    patchChecklistItem: async (itemId: number, item: ChecklistItem): Promise<ChecklistItem> => {
        const { data } = await API.patch<ChecklistItem>(`/checklist/item/${itemId}`, item);
        return data;
    },
    deleteChecklistItem: async (itemId: number) => {
        await API.delete(`/checklist/item/${itemId}`);
    },
    markChecklistItem: async (itemId: number, completed: boolean) => {
        const { data } = await API.patch<ChecklistItem>(`/checklist/item/${itemId}`, { completed });
        return data;
    }
};