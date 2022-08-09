import { API } from ".";
import { Card, CardActivity, CardComment } from "./types";
export interface MoveCardParams {
    list_id: number;
    position: number;
}


export const getCard = async (cardId: number) => {
    const { data } = await API.get<Card>(`/card/${cardId}`);
    return data;
};

export const postCardComment = async (cardId: number, comment: Partial<CardComment>) => {
    const { data } = await API.post<CardActivity>(`/card/${cardId}/comment`, comment);
    return data;
};

export const postCard = async (boardListId: number, card: Card) => {
    const { data } = await API.post<Card>(`/list/${boardListId}/card`, card);
    return data;
};

export const patchCard = async (cardId: number, updatedCard: Card) => {
    const { data } = await API.patch<Card>(`/card/${cardId}`, updatedCard);
    return data;
};

export const moveCard = async (cardId: number, params: MoveCardParams) => {
    const { data } = await API.patch<Card>(`/card/${cardId}`, params);
    return data;
};