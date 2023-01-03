import { ActionContext } from "vuex";
import { State } from "../index";

import { Card, CardActivity, CardChecklist, ChecklistItem, CardActivityQueryType, CardMember, CardDate } from "@/api/types";
import { CardAPI } from "@/api/card";
import { ChecklistAPI } from "@/api/checklist";
import { SIOChecklistItemDeleteEvent, SIOChecklistItemUpdateOrder } from "@/socket";

export interface CardState {
    card: null | Card;
    cardActivityQueryType: CardActivityQueryType;
    cardMoved: boolean;
}

type Context = ActionContext<CardState, State>;

export default {
    namespaced: true as const,
    state: {
        card: null,
        cardActivityQueryType: localStorage.getItem("cardActivityQueryType") || "comment",
        cardMoved: false
    } as CardState,
    getters: {},
    mutations: {
        setCard(state: CardState, value: Card) {
            state.card = value;
        },
        updateCard(state: CardState, payload: Partial<Card>) {
            if (state.card) {
                state.card = Object.assign(state.card, payload);
            }
        },
        addCardActivity(state: CardState, activity: CardActivity) {
            state.card?.activities.unshift(CardAPI.parseCardActivity(activity));
        },
        addChecklist(state: CardState, checklist: CardChecklist) {
            if (state.card) {
                state.card.checklists.push(checklist);
            }
        },
        removeChecklist(state: CardState, checklist_id: number) {
            if (state.card) {
                const index = state.card.checklists?.findIndex((el) => el.id == checklist_id);
                if (index > -1) {
                    state.card.checklists.splice(index, 1);
                }
            }
        },
        addChecklistItem(state: CardState, item: ChecklistItem) {
            const checklist = state.card?.checklists.find((el) => el.id === item.checklist_id);
            if (checklist) {
                console.log("[addChecklistItem]: Push item into checklist.");
                checklist.items.push(ChecklistAPI.parseChecklistItem(item));

                /* FIXME: By some reason if you create a fresh checklist and add an item (before closing the card dialog)
                it creates duplicate items. But when you reopen CardDetailsDialog the issue is gone.
                */
                const items = checklist.items.filter((el) => el.id === item.id);
                console.log(`Have duplicate: ${items.length}`);
            }
        },
        removeChecklistItem(state: CardState, deleteEvent: SIOChecklistItemDeleteEvent) {
            const checklist = state.card?.checklists.find((el) => el.id == deleteEvent.checklist_id);
            if (checklist) {
                const itemIndex = checklist.items.findIndex((el) => el.id == deleteEvent.entity_id) || -1;

                if (itemIndex > -1) checklist.items.splice(itemIndex, 1);
            }
        },
        updateChecklistItem(state: CardState, item: ChecklistItem) {
            const checklist = state.card?.checklists.find((el) => el.id == item.checklist_id);
            if (checklist) {
                const itemIndex = checklist.items.findIndex((el) => el.id == item.id);

                if (itemIndex > -1) checklist.items[itemIndex] = ChecklistAPI.parseChecklistItem(item);
            }

        },
        updateChecklist(state: CardState, list: CardChecklist) {
            const index = state.card?.checklists.findIndex((el) => el.id == list.id) || -1;
            if (state.card && index > -1) state.card.checklists[index] = list;
        },
        updateChecklistItemOrder(state: CardState, event: SIOChecklistItemUpdateOrder) {
            if (state.card) {
                const checklist = state.card.checklists.find((el) => el.id === event.checklist_id);
                if (checklist) {
                    checklist.items.sort((a, b) => event.order.indexOf(a.id) - event.order.indexOf(b.id));
                    checklist.items.forEach((el, index) => {
                        el.position = index;
                    });
                }
            }
        },
        unloadCard(state: CardState) {
            state.card = null;
        },
        setCardActivityQueryType(state: CardState, value: CardActivityQueryType) {
            state.cardActivityQueryType = value;
            localStorage.setItem("cardActivityQueryType", value);
        },
        addCardAsisgnment(state: CardState, member: CardMember) {
            state.card?.assigned_members.push(member);
        },
        removeCardAssignment(state: CardState, member_id: number) {
            // Find card member
            if (state.card) {
                const index = state.card.assigned_members.findIndex((el) => el.id == member_id);
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
        deleteCardDate(state: CardState, item_id: number) {
            if (state.card) {
                const index = state.card.dates.findIndex((el) => el.id == item_id);
                if (index > -1) {
                    state.card.dates.splice(index, 1);
                }
            }
        },
        updateCardActivity(state: CardState, activity: CardActivity) {
            if (state.card) {
                const index = state.card.activities.findIndex((el) => el.id == activity.id);
                if (index > -1) {
                    state.card.activities[index] = CardAPI.parseCardActivity(activity);
                }
            }
        },
        deleteCardActivity(state: CardState, activity_id: number) {
            if (state.card) {
                const index = state.card.activities.findIndex((el) => el.id == activity_id);
                if (index > -1) {
                    state.card.activities.splice(index, 1);
                }
            }
        }
    },
    actions: {
        async loadCard(context: Context, cardId: number) {
            try {
                const card: Card = await CardAPI.getCard(cardId);
                context.commit("setCard", card);
            }
            catch (err) {
                console.log(err);
            }
        },
    }
};
