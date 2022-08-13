import { Card, CardActivity, CardComment } from "@/api/types";
import { deleteCard, getCard, getCardActivities, postCardComment } from "@/api/card";

type InitialState = {
    visible: boolean;
    card: null | Card;
    cardLoading: boolean;
    activitiesLoading: boolean;
};

export default {
    namespaced: true as const,
    state: {
        visible: false,
        card: null,
        cardLoading: false,
        activitiesLoading: false,
    } as InitialState,
    getters: {},
    mutations: {
        setVisible(state: InitialState, value: boolean) {
            state.visible = value;
        },
        setCard(state: InitialState, value: Card) {
            state.card = value;
        },
        setCardActivities(state: InitialState, value: CardActivity[]) {
            if (state.card != undefined) {
                state.card.activities = value;
            }
        },
        setActivitiesLoading(state: InitialState, value: boolean) {
            state.activitiesLoading = value;
        },
        setCardLoading(state: InitialState, value: boolean) {
            state.cardLoading = value;
        },
        addComment(state: InitialState, activity: CardActivity) {
            state.card?.activities?.unshift(activity);
        }
    },
    actions: {
        async loadCard({ commit }: any, cardId: number) {
            try {
                commit("setCardLoading", true);
                const card: Card = await getCard(cardId);
                commit("setCard", card);
            }
            catch (err) {
                console.log(err);
            }
            finally {
                commit("setCardLoading", false);
            }
        },
        async loadCardActivities({ commit, state }: any) {
            try {
                commit("setActivitiesLoading", true);
                const activities: CardActivity[] = await getCardActivities(state.card.id);
                commit("setCardActivities", activities);
            }
            catch (err) {
                console.log(err);
            }
            finally {
                commit("setActivitiesLoading", false);
            }
        },
        async addCardComment({ commit, state }: any, payload: string) {
            const commentActivity = await postCardComment(state.card.id, { comment: payload });
            commit("addComment", commentActivity);
        },
        async deleteCardFromAPI({ commit, state }: any, card: Card) {
            // Close dialog
            commit("setVisible", false);
            console.log(card);
            if (card.id) {
                await deleteCard(card.id);
                commit("board/removeCard", { boardListId: card.list_id, card }, { root: true });
            }

        }
    }
};