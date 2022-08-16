import { API } from ".";
import { Board, BoardClaims } from "./types";

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
