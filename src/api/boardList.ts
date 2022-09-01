import { API } from ".";
import { BoardList } from "./types";

export const BoardListAPI = {
    postBoardList: async (boardListid: number, boardList: BoardList) => {
        const { data } = await API.post<BoardList>(`/board/${boardListid}/list`, boardList);
        return data;
    },
    patchBoardList: async (boardListid: number, boardList: BoardList) => {
        const { data } = await API.patch<BoardList>(`/list/${boardListid}`, boardList);
        return data;
    },
    deleteBoardList: async (boardListId: number) => {
        return await API.delete(`/list/${boardListId}`);
    },
    updateCardsOrder: async (boardList: BoardList) => {
        const orderData = boardList.cards.map((el) => el.id);
        await API.patch(`/list/${boardList.id}/cards-order`, orderData);
    },
};