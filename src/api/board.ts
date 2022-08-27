import { API } from ".";
import { Board, BoardClaims, BoardRole, AddBoardMemberType, BoardAllowedUser } from "./types";

export const getBoards = async () => {
    const { data } = await API.get<Board[]>("board");
    return data;
};

export const getBoard = async (boardId: number) => {
    const { data } = await API.get<Board>(`/board/${boardId}`);
    return data;
};

export const postBoard = async (board: Partial<Board>) => {
    const { data } = await API.post<Board>("/board", board);
    return data;
};

export const deleteBoard = async (boardId: number) => {
    await API.delete(`/board/${boardId}`);
};

export const updateBoardListsOrder = async (board: Board) => {
    const order = board.lists.map((el) => el.id);
    await API.patch(`/board/${board.id}/boardlists-order`, order);
};

export const getBoardClaims = async (boardId: number) => {
    const { data } = await API.get<BoardClaims>(`/board/${boardId}/user-claims`);
    return data;
};

export const getBoardRoles = async (boardId: number) => {
    const { data } = await API.get<BoardRole[]>(`/board/${boardId}/roles`);
    return data;
};

export const addBoardMember = async (boardId: number, member: AddBoardMemberType) => {
    const { data } = await API.post<BoardAllowedUser>(`/board/${boardId}/member`, member);
    return data;
};

export const getBoardMember = async (boardId: number, userId: number) => {
    const { data } = await API.post(`/board/${boardId}/find-member`, { user_id: userId });
    return data;
};