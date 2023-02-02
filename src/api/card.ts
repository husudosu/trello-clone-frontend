import moment from "moment-timezone";

import { API } from ".";
import { ICard, ICardActivity, ICardActivityQueryParams, ICardComment, ICardDate, ICardMember, IDraftCard, IDraftCardDate, IDraftCardMember, IPaginatedCardActivity } from "./types";
import { ChecklistAPI } from "./checklist";
import { useAuthStore } from "@/stores/auth";

export interface MoveCardParams {
    list_id: number;
    position: number;
}

export const CardAPI = {
    parseCardDate: (data: ICardDate) => {
        const authStore = useAuthStore();
        if (data.dt_from) {
            data.dt_from = moment.utc(data.dt_from).tz(authStore.timezone);
        }
        data.dt_to = moment.utc(data.dt_to).tz(authStore.timezone);
        return data;
    },
    parseCardComment: (data: ICardComment) => {
        const authStore = useAuthStore();
        data.created = moment.utc(data.created).tz(authStore.timezone);
        data.updated = moment.utc(data.updated).tz(authStore.timezone);
        return data;
    },
    parseCardActivity: (data: ICardActivity) => {
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
    parseCard: (data: ICard): ICard => {
        const authStore = useAuthStore();
        data.dates.forEach((dt) => {
            if (dt.dt_from) {
                dt.dt_from = moment.utc(dt.dt_from).tz(authStore.timezone);
            }
            dt.dt_to = moment.utc(dt.dt_to).tz(authStore.timezone);
        });

        data.created_on = moment.utc(data.created_on).tz(authStore.timezone);
        if (data.archived_on) {
            data.archived_on = moment.utc(data.archived_on).tz(authStore.timezone);
        }

        data.checklists.forEach((checklist) => {
            checklist.items.forEach((item) => {
                // Parse checklist items
                ChecklistAPI.parseChecklistItem(item);
            });
        });

        data.file_uploads.forEach((file) => {
            file.created_on = moment.utc(file.created_on).tz(authStore.timezone);
        });

        return data;
    },
    getCard: async (cardId: number): Promise<ICard> => {
        const { data } = await API.get<ICard>(`/card/${cardId}`);
        return CardAPI.parseCard(data);
    },
    postCard: async (boardListId: number, card: IDraftCard) => {
        const { data } = await API.post<ICard>(`/list/${boardListId}/card`, card);
        return CardAPI.parseCard(data);
    },
    patchCard: async (cardId: number, updatedCard: Partial<ICard>) => {
        const { data } = await API.patch<ICard>(`/card/${cardId}`, updatedCard);
        return CardAPI.parseCard(data);
    },
    moveCard: async (cardId: number, params: MoveCardParams) => {
        const { data } = await API.patch<ICard>(`/card/${cardId}`, params);
        return CardAPI.parseCard(data);
    },
    deleteCard: async (cardId: number) => {
        await API.delete(`/card/${cardId}`);
    },
    postCardComment: async (cardId: number, comment: Partial<ICardComment>): Promise<ICardActivity> => {
        const authStore = useAuthStore();
        const { data } = await API.post<ICardActivity>(`/card/${cardId}/comment`, comment);
        data.activity_on = moment.utc(data.activity_on).tz(authStore.timezone);
        if (data.comment) {
            data.comment = CardAPI.parseCardComment(data.comment);
        }
        return data;
    },
    patchCardComment: async (commentId: number, comment: Partial<ICardComment>): Promise<ICardComment> => {
        const { data } = await API.patch<ICardComment>(`comment/${commentId}`, comment);
        return data;
    },
    getCardActivities: async (cardId: number, params: ICardActivityQueryParams) => {
        const authStore = useAuthStore();
        if (params.dt_to) {
            params.dt_to = moment.tz(params.dt_to, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        if (params.dt_from) {
            params.dt_from = moment.tz(params.dt_from, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }

        const { data } = await API.get<IPaginatedCardActivity>(`/card/${cardId}/activities`, { params });
        data.data.forEach((el) => {
            CardAPI.parseCardActivity(el);
        });
        return data;
    },
    assignCardMember: async (cardId: number, member: IDraftCardMember): Promise<ICardMember> => {
        const { data } = await API.post<ICardMember>(`/card/${cardId}/assign-member`, member);
        return data;
    },
    deassignCardMember: async (cardId: number, boardUserId: number) => {
        const { data } = await API.post<ICardMember>(`/card/${cardId}/deassign-member`, { board_user_id: boardUserId });
        return data;
    },
    postCardDate: async (cardId: number, dt: IDraftCardDate): Promise<ICardDate> => {
        const authStore = useAuthStore();
        // Convert date to UTC before pushing to API
        dt.dt_to = moment.tz(dt.dt_to, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        if (dt.dt_from) {
            dt.dt_from = moment.tz(dt.dt_from, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }

        const { data } = await API.post<ICardDate>(`/card/${cardId}/date`, dt);
        return CardAPI.parseCardDate(data);
    },
    patchCardDate: async (cardDateId: number, dt: Partial<ICardDate>): Promise<ICardDate> => {
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
        const { data } = await API.patch<ICardDate>(`/date/${cardDateId}`, cdt);
        return CardAPI.parseCardDate(data);
    },
    deleteCardDate: async (cardDateId: number) => {
        await API.delete(`/date/${cardDateId}`);
    },
    deleteComment: async (commentId: number) => {
        await API.delete(`/comment/${commentId}`);
    },
    uploadFile: async (cardId: number, file: Blob) => {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await API.post(`/card/${cardId}/uploads`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return data;
    },
    downloadFile: async (fileId: number, fileName: string) => {
        API.get(`/card-upload/${fileId}`, { responseType: "blob" })
            .then((response) => {
                console.log(response.data);
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
            });
    },
    deleteFile: async (fileId: number) => {
        await API.delete(`/card-upload/${fileId}`);
    }
};