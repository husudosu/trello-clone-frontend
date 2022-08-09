import { Card, CardActivity, CardComment } from "@/api/types";
import { getCard, postCardComment } from "@/api/card";

type InitialState = {
    visible: boolean;
    card: null | Card;
};

export default {
    namespaced: true as const,
    state: {
        visible: false,
        card: null
    } as InitialState,
    getters: {},
    mutations: {
        setVisible(state: InitialState, value: boolean) {
            state.visible = value;
        },
        setCard(state: InitialState, value: Card) {
            state.card = value;
        },
        addComment(state: InitialState, activity: CardActivity) {
            state.card?.activities?.unshift(activity);
        }
    },
    actions: {
        async loadCard({ commit }: any, payload: { cardId: number; }) {
            const card: Card = await getCard(payload.cardId);
            commit("setCard", card);
        },
        async addCardComment({ commit, state }: any, payload: Partial<CardComment>) {
            const commentActivity = await postCardComment(state.card.id, payload);
            commit("addComment", commentActivity);
        }
    }
};