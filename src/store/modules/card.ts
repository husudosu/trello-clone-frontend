import { ActionContext } from "vuex";
import { State } from "../index";

import { Card, CardActivity, CardChecklist, ChecklistItem, DraftChecklistItem } from "@/api/types";
import { CardAPI } from "@/api/card";
import { ChecklistAPI } from "@/api/checklist";

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
        },
        addChecklist(state: CardState, checklist: CardChecklist) {
            state.card?.checklists?.push(checklist);
        },
        removeChecklist(state: CardState, checklist: CardChecklist) {
            if (state.card?.checklists) {
                const index = state.card.checklists?.findIndex((el) => el.id == checklist.id);
                if (index > -1) {
                    state.card.checklists.splice(index, 1);
                }
            }
        },
        addChecklistItem(state: CardState, item: ChecklistItem) {
            if (state.card?.checklists) {
                const index = state.card.checklists.findIndex((el) => el.id == item.checklist_id);
                if (index > -1) {
                    state.card.checklists[index].items.push(item);
                }
            }
        },
        removeChecklistItem(state: CardState, item: ChecklistItem) {
            if (state.card?.checklists) {
                const index = state.card.checklists.findIndex((el) => el.id == item.checklist_id);
                if (index > -1) {
                    state.card.checklists[index].items.splice(state.card.checklists[index].items.indexOf(item), 1);
                }
            }
        },
        updateChecklistItem(state: CardState, item: ChecklistItem) {
            if (state.card?.checklists) {
                const index = state.card.checklists.findIndex((el) => el.id == item.checklist_id);
                if (index > -1) {
                    const itemIndex = state.card.checklists[index].items.findIndex((el) => el.id == item.id);
                    if (itemIndex > -1) {
                        state.card.checklists[index].items[itemIndex] = item;
                    }
                }
            }
        },
    },
    actions: {
        async loadCard(context: Context, cardId: number) {
            try {
                context.commit("setCardLoading", true);
                const card: Card = await CardAPI.getCard(cardId);
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
                    const activities: CardActivity[] = await CardAPI.getCardActivities(context.state.card.id);
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
                const commentActivity = await CardAPI.postCardComment(context.state.card.id, { comment: payload });
                context.commit("addComment", commentActivity);
            }
        },
        async deleteCardFromAPI(context: Context, card: Card) {
            // Close dialog
            context.commit("setVisible", false);
            if (card.id) {
                await CardAPI.deleteCard(card.id);
                context.commit("board/removeCard", { boardListId: card.list_id, card }, { root: true });
            }
        },
        async addCardChecklist(context: Context, checklist: Partial<CardChecklist>) {
            if (context.state.card?.id) {
                const data = await ChecklistAPI.postCardChecklist(context.state.card.id, checklist);
                context.commit("addChecklist", data);
            }
        },
        async deleteCardChecklist(context: Context, checklist: CardChecklist) {
            await ChecklistAPI.deleteCardchecklist(checklist.id);
            context.commit("removeChecklist", checklist);
        },
        async addChecklistItem(context: Context, payload: { checklistId: number; item: DraftChecklistItem; }) {
            const data = await ChecklistAPI.postChecklistItem(payload.checklistId, payload.item);
            context.commit("addChecklistItem", data);
        },
        async deleteChecklistItem(context: Context, item: ChecklistItem) {
            await ChecklistAPI.deleteChecklistItem(item.id);
            context.commit("removeChecklistItem", item);
        },
        async markChecklistItem(context: Context, item: ChecklistItem) {
            const data = await ChecklistAPI.markChecklistItem(item.id, item.completed);
            context.commit("updateChecklistItem", item);
            // FIXME: Reload card activities, probably not the best solution!
            await context.dispatch("loadCardActivities");
        }
    }
};