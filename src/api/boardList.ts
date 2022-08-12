import { API } from ".";
import { BoardList } from "./types";
export interface Order {
    id: number | undefined;
    position: number | undefined;
}

export const updateCardsOrder = async (boardList: BoardList) => {
    const orderData = boardList.cards.map((el) => el.id);
    await API.patch(`/list/${boardList.id}/cards-order`, orderData);
};

export const postBoardList = async (boardId: number, boardList: BoardList) => {
    const { data } = await API.post<BoardList>(`/board/${boardId}/list`, boardList);
    return data;
};

export const patchBoardList = async (boardListid: number, boardList: BoardList) => {
    const { data } = await API.patch<BoardList>(`/list/${boardListid}`, boardList);
    return data;
};

export const deleteBoardList = async (boardListId: number) => {
    return await API.delete(`/list/${boardListId}`);
};