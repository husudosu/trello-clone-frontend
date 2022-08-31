import { ActionContext } from "vuex";
import { State } from "../index";

import { Card, CardActivity } from "@/api/types";
import { deleteCard, getCard, getCardActivities, postCardComment } from "@/api/card";

export interface CardState {
    visible: boolean;
    card: null | Card;
    cardLoading: boolean;
    activitiesLoading: boolean;
}

type Context = ActionContext<CardState, State>;

export default {
    namespaced: true as const,
    state: {
        visible: false,
        card: null,
        cardLoading: false,
        activitiesLoading: false,
    } as CardState,
    getters: {},
    mutations: {
        setVisible(state: CardState, value: boolean) {
            state.visible = value;
        },
        setCard(state: CardState, value: Card) {
            state.card = value;
        },
        setCardActivities(state: CardState, value: CardActivity[]) {
            if (state.card != undefined) {
                state.card.activities = value;
            }
        },
        setActivitiesLoading(state: CardState, value: boolean) {
            state.activitiesLoading = value;
        },
        setCardLoading(state: CardState, value: boolean) {
            state.cardLoading = value;
        },
        addComment(state: CardState, activity: CardActivity) {
            state.card?.activities?.unshift(activity);
        }
    },
    actions: {
        async loadCard(context: Context, cardId: number) {
            try {
                context.commit("setCardLoading", true);
                const card: Card = await getCard(cardId);
                context.commit("setCard", card);
            }
            catch (err) {
                console.log(err);
            }
            finally {
                context.commit("setCardLoading", false);
            }
        },
        async loadCardActivities(context: Context) {
            try {
                // FIXME: Card always has id if saved on db fix type!
                if (context.state.card && context.state.card.id) {
                    context.commit("setActivitiesLoading", true);
                    const activities: CardActivity[] = await getCardActivities(context.state.card.id);
                    context.commit("setCardActivities", activities);
                }
            }
            catch (err) {
                console.log(err);
            }
            finally {
                context.commit("setActivitiesLoading", false);
            }
        },
        async addCardComment(context: Context, payload: string) {
            if (context.state.card && context.state.card.id) {
                const commentActivity = await postCardComment(context.state.card.id, { comment: payload });
                context.commit("addComment", commentActivity);
            }
        },
        async deleteCardFromAPI(context: Context, card: Card) {
            // Close dialog
            context.commit("setVisible", false);
            if (card.id) {
                await deleteCard(card.id);
                context.commit("board/removeCard", { boardListId: card.list_id, card }, { root: true });
            }

        }
    }
};