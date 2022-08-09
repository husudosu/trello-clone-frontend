import { API } from ".";
import { BoardList } from "./types";
export interface Order {
    id: number | undefined;
    position: number | undefined;
}

export const updateCardsOrder = async (boardList: BoardList) => {
    // Remove non-essential stuff for order
    const orderData = [];
    if (boardList.cards !== undefined) {
        for (const item of boardList.cards) {
            // Only order existing items.
            if (item.id !== undefined) {
                orderData.push({
                    id: item.id,
                    position: item.position
                });
            }
        }
        const { data } = await API.patch(`/list/${boardList.id}/cards-order`, orderData);
        return data;
    }
};

export const postBoardList = async (boardId: number, boardList: BoardList) => {
    const { data } = await API.post<BoardList>(`/board/${boardId}/list`, boardList);
    return data;
};

export const patchBoardList = async (boardListid: number, boardList: BoardList) => {
    const { data } = await API.patch<BoardList>(`/list/${boardListid}`, boardList);
    return data;
};