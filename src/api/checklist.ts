import { useAuthStore } from "@/stores/auth";
import moment from "moment-timezone";

import { API } from ".";
import { IBoardAllowedUser, ICardChecklist, IChecklistItem, IDraftChecklistItem } from "./types";

export const ChecklistAPI = {
    parseChecklistItem: (data: IChecklistItem) => {
        const authStore = useAuthStore();
        if (data.marked_complete_on) {
            data.marked_complete_on = moment.utc(data.marked_complete_on).tz(authStore.timezone);
        }
        return data;
    },
    postCardChecklist: async (cardId: number, checklist: Partial<ICardChecklist>): Promise<ICardChecklist> => {
        const { data } = await API.post<ICardChecklist>(`/card/${cardId}/checklist`, checklist);
        return data;
    },
    patchCardChecklist: async (checklistId: number, checklist: Partial<ICardChecklist>): Promise<ICardChecklist> => {
        const { data } = await API.patch<ICardChecklist>(`/checklist/${checklistId}`, checklist);
        return data;
    },
    deleteCardchecklist: async (checklistId: number) => {
        await API.delete(`/checklist/${checklistId}`);
        return {};
    },
    postChecklistItem: async (checklistId: number, item: IDraftChecklistItem): Promise<IChecklistItem> => {
        const { data } = await API.post<IChecklistItem>(`/checklist/${checklistId}/item`, item);
        return ChecklistAPI.parseChecklistItem(data);
    },
    patchChecklistItem: async (itemId: number, item: Partial<IChecklistItem>): Promise<IChecklistItem> => {
        // Make clone of dt before conversion
        const { data } = await API.patch<IChecklistItem>(`/checklist/item/${itemId}`, item);
        return ChecklistAPI.parseChecklistItem(data);
    },
    assignMemberToChecklistItem: async (itemId: number, member: IBoardAllowedUser) => {
        const { data } = await API.patch<IChecklistItem>(`/checklist/item/${itemId}`, { assigned_board_user_id: member.id });
        return ChecklistAPI.parseChecklistItem(data);
    },
    deassignMemberToChecklistItem: async (itemId: number) => {
        const { data } = await API.patch<IChecklistItem>(`/checklist/item/${itemId}`, { assigned_board_user_id: null });
        return ChecklistAPI.parseChecklistItem(data);
    },
    deleteChecklistItem: async (itemId: number) => {
        await API.delete(`/checklist/item/${itemId}`);
    },
    markChecklistItem: async (itemId: number, completed: boolean): Promise<IChecklistItem> => {
        const { data } = await API.patch<IChecklistItem>(`/checklist/item/${itemId}`, { completed });
        return ChecklistAPI.parseChecklistItem(data);
    },
    updateItemsOrder: async (checklist: ICardChecklist) => {
        const orderData = checklist.items.map((el) => el.id);
        await API.patch(`/checklist/${checklist.id}/items-order`, orderData);
    }
};