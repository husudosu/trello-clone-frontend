import { API } from ".";
import { CardAPI } from "./card";
import { IBoardList, IDraftBoardList } from "./types";

export const BoardListAPI = {
    parseBoardList: (data: IBoardList) => {
        data.cards.forEach((el) => {
            CardAPI.parseCard(el);
        });
        return data;
    },
    postBoardList: async (boardId: number, boardList: IDraftBoardList) => {
        const { data } = await API.post<IBoardList>(`/board/${boardId}/list`, boardList);
        return data;
    },
    patchBoardList: async (boardListid: number, boardList: Partial<IBoardList>) => {
        const { data } = await API.patch<IBoardList>(`/list/${boardListid}`, boardList);
        return data;
    },
    deleteBoardList: async (boardListId: number) => {
        return await API.delete(`/list/${boardListId}`);
    },
    updateCardsOrder: async (boardList: IBoardList) => {
        const orderData = boardList.cards.map((el) => el.id);
        await API.patch(`/list/${boardList.id}/cards-order`, orderData);
    },
};