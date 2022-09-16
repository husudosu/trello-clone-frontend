import { ActionContext } from "vuex";
import { State } from "../index";

import { Card, CardActivity, CardActivityQueryParams, CardChecklist, ChecklistItem, DraftChecklistItem, PaginatedResponse, CardActivityQueryType } from "@/api/types";
import { CardAPI } from "@/api/card";
import { ChecklistAPI } from "@/api/checklist";

export interface CardState {
    visible: boolean;
    card: null | Card;
    cardLoading: boolean;
    activitiesLoading: boolean;
    activities: CardActivity[];
    activityPagination: PaginatedResponse | null;
    cardActivityQueryType: CardActivityQueryType;
}

type Context = ActionContext<CardState, State>;

export default {
    namespaced: true as const,
    state: {
        visible: false,
        card: null,
        cardLoading: false,
        activitiesLoading: false,
        activities: [],
        activityPagination: null,
        cardActivityQueryType: "comment"
    } as CardState,
    getters: {},
    mutations: {
        setVisible(state: CardState, value: boolean) {
            state.visible = value;
        },
        setCard(state: CardState, value: Card) {
            state.card = value;
        },
        addCardActivities(state: CardState, value: CardActivity[]) {
            if (state.card != undefined) {
                state.activities.push(...value);
            }
        },
        setCardActivitiesPagination(state: CardState, value: PaginatedResponse) {
            state.activityPagination = value;
        },
        setActivitiesLoading(state: CardState, value: boolean) {
            state.activitiesLoading = value;
        },
        setCardLoading(state: CardState, value: boolean) {
            state.cardLoading = value;
        },
        addComment(state: CardState, activity: CardActivity) {
            console.log("TODO");
            // state.card?.activities?.unshift(activity);
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
        updateChecklist(state: CardState, list: CardChecklist) {
            if (state.card?.checklists) {
                const index = state.card.checklists.findIndex((el) => el.id == list.id);
                if (index > -1) {
                    console.log("Update");
                    state.card.checklists[index] = list;
                }
            }
        },
        unloadCard(state: CardState) {
            state.card = null;
            state.activities = [];
            state.activityPagination = null;
        },
        setCardActivityQueryType(state: CardState, value: CardActivityQueryType) {
            state.cardActivityQueryType = value;
        },
        unloadCardActivities(state: CardState) {
            state.activities = [];
            state.activityPagination = null;
        }
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
        async loadCardActivities(context: Context, params: CardActivityQueryParams = {}) {
            const timeout = setTimeout(() => { context.commit("setActivitiesLoading", true); }, 60);
            try {
                if (context.state.card) {
                    params.type = context.state.cardActivityQueryType;
                    const result = await CardAPI.getCardActivities(context.state.card.id, params);
                    // Extend activities.
                    context.commit("addCardActivities", result.data);
                    // Set pagination object
                    context.commit("setCardActivitiesPagination", result);
                }
            }
            catch (err) {
                console.log(err);
            }
            finally {
                clearTimeout(timeout);
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
                context.commit("board/removeCard", card, { root: true });
            }
        },
        async addCardChecklist(context: Context, checklist: Partial<CardChecklist>) {
            if (context.state.card?.id) {
                const data = await ChecklistAPI.postCardChecklist(context.state.card.id, checklist);
                context.commit("addChecklist", data);
            }
        },
        async updateCardChecklist(context: Context, checklist: CardChecklist) {
            const data = await ChecklistAPI.patchCardChecklist(checklist.id, checklist);
            context.commit("updateChecklist", data);
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
            context.commit("updateChecklistItem", data);
            // FIXME: Reload card activities, probably not the best solution!
            await context.dispatch("loadCardActivities");
        },
        async updateChecklistItem(context: Context, item: ChecklistItem) {
            context.commit("updateChecklistItem", item);
            await ChecklistAPI.patchChecklistItem(item.id, item);
        }
    }
};