import { API } from ".";
import { IBoard, IBoardClaims, IBoardRole, IAddBoardMemberType, IBoardAllowedUser, ICardActivityQueryParams, IPaginatedCardActivity, IArchivedCard, IArchivedList } from "./types";

import moment from "moment-timezone";
import { CardAPI } from "./card";
import { useAuthStore } from "@/stores/auth";

export const BoardAPI = {
    parseArchivedEntities: (data: IArchivedList[] | IArchivedCard[] | IArchivedCard | IArchivedList) => {
        const authStore = useAuthStore();
        if (Array.isArray(data)) {
            data.forEach((el) => {
                BoardAPI.parseArchivedEntities(el);
            });
        } else {
            data.archived_on = moment.utc(data.archived_on).tz(authStore.timezone);
            return data;
        }
    },
    getBoards: async (): Promise<IBoard[]> => {
        const { data } = await API.get<IBoard[]>("board");
        return data;
    },
    getArchivedBoards: async (): Promise<IBoard[]> => {
        const { data } = await API.get<IBoard[]>("board", { params: { archived: true } });
        return data;
    },
    getArchivedCards: async (boardId: number): Promise<IArchivedCard[]> => {
        const { data } = await API.get<IArchivedCard[]>(`/board/${boardId}/archived-cards`);
        // Convert archived_on to moment
        BoardAPI.parseArchivedEntities(data);
        return data;
    },
    getArchivedLists: async (boardId: number): Promise<IArchivedList[]> => {
        const { data } = await API.get<IArchivedList[]>(`/board/${boardId}/archived-lists`);
        // Convert archived_on to moment
        BoardAPI.parseArchivedEntities(data);
        return data;
    },
    getBoardActivities: async (boardId: number, params: ICardActivityQueryParams): Promise<IPaginatedCardActivity> => {
        const authStore = useAuthStore();
        if (params.dt_to) {
            params.dt_to = moment.tz(params.dt_to, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        if (params.dt_from) {
            params.dt_from = moment.tz(params.dt_from, authStore.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        const { data } = await API.get<IPaginatedCardActivity>(`/board/${boardId}/activities`, { params });
        data.data.forEach((el) => {
            CardAPI.parseCardActivity(el);
        });
        return data;
    },
    revertBoard: async (boardId: number): Promise<IBoard> => {
        const { data } = await API.post<IBoard>(`/board/${boardId}/revert`);
        return data;
    },
    getBoard: async (boardId: number): Promise<IBoard> => {
        const { data } = await API.get<IBoard>(`/board/${boardId}`);
        const authStore = useAuthStore();
        // Convert datetimes to moment
        data.lists.forEach((list) => {
            list.cards.forEach((card) => {

                // Convert dates to moment dates.
                card.dates.forEach((dt) => {
                    if (dt.dt_from) {
                        dt.dt_from = moment.utc(dt.dt_from).tz(authStore.timezone);
                    }
                    dt.dt_to = moment.utc(dt.dt_to).tz(authStore.timezone);
                });
            });
        });
        return data;
    },
    postBoard: async (board: Partial<IBoard>): Promise<IBoard> => {
        const { data } = await API.post<IBoard>("/board", board);
        return data;
    },
    patchBoard: async (boardId: number, board: Partial<IBoard>): Promise<IBoard> => {
        const { data } = await API.patch<IBoard>(`/board/${boardId}`, board);
        return data;
    },
    deleteBoard: async (boardId: number) => {
        await API.delete(`/board/${boardId}`);
    },
    updateBoardListsOrder: async (board: IBoard) => {
        const order = board.lists.map((el) => el.id);
        await API.patch(`/board/${board.id}/boardlists-order`, order);
    },
    getBoardClaims: async (boardId: number): Promise<IBoardClaims> => {
        const { data } = await API.get<IBoardClaims>(`/board/${boardId}/user-claims`);
        return data;
    },
    getBoardRoles: async (boardId: number): Promise<IBoardRole[]> => {
        const { data } = await API.get<IBoardRole[]>(`/board/${boardId}/roles`);
        return data;
    },
    addBoardMember: async (boardId: number, member: IAddBoardMemberType): Promise<IBoardAllowedUser> => {
        const { data } = await API.post<IBoardAllowedUser>(`/board/${boardId}/member`, member);
        return data;
    },
    getBoardMember: async (boardId: number, userId: number) => {
        const { data } = await API.post(`/board/${boardId}/find-member`, { user_id: userId });
        return data;
    },
    getBoardMembers: async (boardId: number): Promise<IBoardAllowedUser[]> => {
        const { data } = await API.get<IBoardAllowedUser[]>(`/board/${boardId}/member`);
        return data;
    },
    deleteBoardMember: async (boardId: number, userId: number) => {
        const { data } = await API.delete(`/board/${boardId}/member/${userId}`);
        return data;
    },
    updateBoardMemberRole: async (boardId: number, userId: number, boardRoleId: number) => {
        const { data } = await API.patch(`/board/${boardId}/member/${userId}`, { board_role_id: boardRoleId });
        return data;
    },
    activateMember: async (memberId: number) => {
        const { data } = await API.post(`/board/member/${memberId}/activate`);
        return data;
    }
};