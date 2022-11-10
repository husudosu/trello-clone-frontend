import { ActionContext } from "vuex";
import { State } from "../index";

import { Card, CardActivity, CardChecklist, ChecklistItem, DraftChecklistItem, PaginatedResponse, CardActivityQueryType, DraftCardMember, CardMember, DraftCardDate, CardDate, BoardAllowedUser } from "@/api/types";
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
    cardMoved: boolean;
}

type Context = ActionContext<CardState, State>;

export default {
    namespaced: true as const,
    state: {
        visible: false,
        card: null,
        cardLoading: false,
        activitiesLoading: false,
        activityPagination: null,
        cardActivityQueryType: localStorage.getItem("cardActivityQueryType") || "comment",
        cardMoved: false
    } as CardState,
    getters: {},
    mutations: {
        setVisible(state: CardState, value: boolean) {
            state.visible = value;
        },
        setCard(state: CardState, value: Card) {
            state.card = value;
        },
        addCardActivity(state: CardState, activity: CardActivity) {
            state.card?.activities.unshift(CardAPI.parseCardActivity(activity));
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
            localStorage.setItem("cardActivityQueryType", value);
        },
        addCardAsisgnment(state: CardState, member: CardMember) {
            state.card?.assigned_members.push(member);
        },
        removeCardAssignment(state: CardState, member: CardMember) {
            // Find card member
            if (state.card) {
                const index = state.card.assigned_members.findIndex((el) => el.id == member.id);
                if (index > -1) {
                    state.card.assigned_members.splice(index, 1);
                }
            }
        },
        setCardMoved(state: CardState, value: boolean) {
            state.cardMoved = value;
        },
        addCardDate(state: CardState, item: CardDate) {
            if (state.card) {
                state.card.dates.push(item);
            }
        },
        updateCardDate(state: CardState, item: CardDate) {
            if (state.card) {
                const index = state.card.dates.findIndex((el) => el.id == item.id);
                if (index > -1) {
                    state.card.dates[index] = item;
                }
            }
        },
        deleteCardDate(state: CardState, item: CardDate) {
            if (state.card) {
                const index = state.card.dates.findIndex((el) => el.id == item.id);
                if (index > -1) {
                    state.card.dates.splice(index, 1);
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
        async addCardComment(context: Context, payload: string) {
            if (context.state.card && context.state.card.id) {
                await CardAPI.postCardComment(context.state.card.id, { comment: payload });
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
        },
        async updateChecklistItem(context: Context, item: ChecklistItem) {
            const data = await ChecklistAPI.patchChecklistItem(item.id, item);
            context.commit("updateChecklistItem", data);
        },
        async assignCardMember(context: Context, item: DraftCardMember) {
            if (context.state.card) {
                const data = await CardAPI.assignCardMember(context.state.card.id, item);
                context.commit("addCardAsisgnment", data);
                context.commit("board/saveCard", context.state.card, { root: true });
            }
        },
        async deassignCardMember(context: Context, item: CardMember) {
            if (context.state.card) {
                await CardAPI.deassignCardMember(context.state.card.id, item.board_user.id);
                context.commit("removeCardAssignment", item);
                context.commit("board/saveCard", context.state.card, { root: true });
            }
        },
        async updateCard(context: Context, item: Card) {
            const updatedCard = await CardAPI.patchCard(item.id, item);
            // Update card on board lists card
            context.commit("board/saveCard", updatedCard, { root: true });
        },
        async addCardDate(context: Context, item: DraftCardDate) {
            if (context.state.card) {
                const dt = await CardAPI.postCardDate(context.state.card.id, item);
                context.commit("addCardDate", dt);
            }
        },
        async updateCardDate(context: Context, item: CardDate) {
            const dt = await CardAPI.patchCardDate(item.id, item);
            context.commit("updateCardDate", dt);
        },
        async deleteCardDate(context: Context, item: CardDate) {
            await CardAPI.deleteCardDate(item.id);
            context.commit("deleteCardDate", item);
        },
        async assignMemberToChecklistItem(context: Context, payload: { member: BoardAllowedUser, item: ChecklistItem; }) {
            const data = await ChecklistAPI.assignMemberToChecklistItem(payload.item.id, payload.member);
            context.commit("updateChecklistItem", data);
        },
        async deassignMemberFromChecklistItem(context: Context, item: ChecklistItem) {
            const data = await ChecklistAPI.deassignMemberToChecklistItem(item.id);
            context.commit("updateChecklistItem", data);
        },
    }
};
