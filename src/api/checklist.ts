import moment from "moment-timezone";

import { API } from ".";
import { BoardAllowedUser, CardChecklist, ChecklistItem, DraftChecklistItem } from "./types";
import store from "@/store";

export const ChecklistAPI = {
    parseChecklistItem: (data: ChecklistItem) => {
        if (data.marked_complete_on) {
            data.marked_complete_on = moment.utc(data.marked_complete_on).tz(store.getters.auth.timezone);
        }
        return data;
    },
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
        return ChecklistAPI.parseChecklistItem(data);
    },
    patchChecklistItem: async (itemId: number, item: ChecklistItem): Promise<ChecklistItem> => {
        const { data } = await API.patch<ChecklistItem>(`/checklist/item/${itemId}`, item);
        return ChecklistAPI.parseChecklistItem(data);
    },
    assignMemberToChecklistItem: async (itemId: number, member: BoardAllowedUser) => {
        const { data } = await API.patch<ChecklistItem>(`/checklist/item/${itemId}`, { assigned_board_user_id: member.id });
        return ChecklistAPI.parseChecklistItem(data);
    },
    deassignMemberToChecklistItem: async (itemId: number) => {
        const { data } = await API.patch<ChecklistItem>(`/checklist/item/${itemId}`, { assigned_board_user_id: null });
        return ChecklistAPI.parseChecklistItem(data);
    },
    deleteChecklistItem: async (itemId: number) => {
        await API.delete(`/checklist/item/${itemId}`);
    },
    markChecklistItem: async (itemId: number, completed: boolean): Promise<ChecklistItem> => {
        const { data } = await API.patch<ChecklistItem>(`/checklist/item/${itemId}`, { completed });
        return ChecklistAPI.parseChecklistItem(data);
    },
    updateItemsOrder: async (checklist: CardChecklist) => {
        const orderData = checklist.items.map((el) => el.id);
        await API.patch(`/checklist/${checklist.id}/items-order`, orderData);
    }
};