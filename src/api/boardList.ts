import { API } from ".";
import { CardAPI } from "./card";
import { BoardList, DraftBoardList } from "./types";

export const BoardListAPI = {
    parseBoardList: (data: BoardList) => {
        data.cards.forEach((el) => {
            CardAPI.parseCard(el);
        });
        return data;
    },
    postBoardList: async (boardId: number, boardList: DraftBoardList) => {
        const { data } = await API.post<BoardList>(`/board/${boardId}/list`, boardList);
        return data;
    },
    patchBoardList: async (boardListid: number, boardList: Partial<BoardList>) => {
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