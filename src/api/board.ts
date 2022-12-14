import { API } from ".";
import { Board, BoardClaims, BoardRole, AddBoardMemberType, BoardAllowedUser, CardActivityQueryParams, PaginatedCardActivity, ArchivedEntity } from "./types";

import moment from "moment-timezone";
import store from "@/store";
import { CardAPI } from "./card";

export const BoardAPI = {
    getBoards: async (): Promise<Board[]> => {
        const { data } = await API.get<Board[]>("board");
        return data;
    },
    getArchivedBoards: async (): Promise<Board[]> => {
        const { data } = await API.get<Board[]>("board", { params: { archived: true } });
        return data;
    },
    getArchivedCards: async (boardId: number): Promise<ArchivedEntity[]> => {
        const { data } = await API.get<ArchivedEntity[]>(`/board/${boardId}/archived-entities`, { params: { "entity_type": "card" } });
        // Convert archived_on to moment
        data.forEach((el) => {
            el.archived_on = moment.utc(el.archived_on).tz(store.getters.auth.timezone);
        });
        return data;
    },
    getArchivedLists: async (boardId: number): Promise<ArchivedEntity[]> => {
        const { data } = await API.get<ArchivedEntity[]>(`/board/${boardId}/archived-entities`, { params: { "entity_type": "list" } });
        // Convert archived_on to moment
        data.forEach((el) => {
            el.archived_on = moment.utc(el.archived_on).tz(store.getters.auth.timezone);
        });
        return data;
    },
    getBoardActivities: async (boardId: number, params: CardActivityQueryParams): Promise<PaginatedCardActivity> => {
        if (params.dt_to) {
            params.dt_to = moment.tz(params.dt_to, store.getters.auth.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        if (params.dt_from) {
            params.dt_from = moment.tz(params.dt_from, store.getters.auth.timezone).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        const { data } = await API.get<PaginatedCardActivity>(`/board/${boardId}/activities`, { params });
        data.data.forEach((el) => {
            CardAPI.parseCardActivity(el);
        });
        return data;
    },
    revertBoard: async (boardId: number) => {
        const { data } = await API.post(`/board/${boardId}/revert`);
        return data;
    },
    getBoard: async (boardId: number): Promise<Board> => {
        const { data } = await API.get<Board>(`/board/${boardId}`);

        // Convert datetimes to moment
        data.lists.forEach((list) => {
            list.cards.forEach((card) => {

                // Convert dates to moment dates.
                card.dates.forEach((dt) => {
                    if (dt.dt_from) {
                        dt.dt_from = moment.utc(dt.dt_from).tz(store.getters.auth.timezone);
                    }
                    dt.dt_to = moment.utc(dt.dt_to).tz(store.getters.auth.timezone);
                });
            });
        });
        return data;
    },
    postBoard: async (board: Partial<Board>): Promise<Board> => {
        const { data } = await API.post<Board>("/board", board);
        return data;
    },
    patchBoard: async (boardId: number, board: Partial<Board>): Promise<Board> => {
        const { data } = await API.patch<Board>(`/board/${boardId}`, board);
        return data;
    },
    deleteBoard: async (boardId: number) => {
        await API.delete(`/board/${boardId}`);
    },
    updateBoardListsOrder: async (board: Board) => {
        const order = board.lists.map((el) => el.id);
        await API.patch(`/board/${board.id}/boardlists-order`, order);
    },
    getBoardClaims: async (boardId: number): Promise<BoardClaims> => {
        const { data } = await API.get<BoardClaims>(`/board/${boardId}/user-claims`);
        return data;
    },
    getBoardRoles: async (boardId: number): Promise<BoardRole[]> => {
        const { data } = await API.get<BoardRole[]>(`/board/${boardId}/roles`);
        return data;
    },
    addBoardMember: async (boardId: number, member: AddBoardMemberType): Promise<BoardAllowedUser> => {
        const { data } = await API.post<BoardAllowedUser>(`/board/${boardId}/member`, member);
        return data;
    },
    getBoardMember: async (boardId: number, userId: number) => {
        const { data } = await API.post(`/board/${boardId}/find-member`, { user_id: userId });
        return data;
    },
    getBoardMembers: async (boardId: number): Promise<BoardAllowedUser[]> => {
        const { data } = await API.get<BoardAllowedUser[]>(`/board/${boardId}/member`);
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