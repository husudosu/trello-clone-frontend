import { defineStore } from "pinia";

import { Card, PaginatedCardActivity, CardActivity, CardChecklist, ChecklistItem, CardMember, CardDate } from "@/api/types";
import { CardAPI } from "@/api/card";
import { ChecklistAPI } from "@/api/checklist";
import { SIOChecklistItemDeleteEvent, SIOChecklistItemUpdateOrder } from "@/socket";

interface State {
    card: null | Card;
    cardMoved: boolean;
    activities: null | PaginatedCardActivity;
}

export const useCardStore = defineStore('card', {
    state: (): State => ({
        card: null,
        cardMoved: false,
        activities: null
    }),
    getters: {
        activityList: (state: State) => state.activities?.data || []
    },
    actions: {
        setCard(payload: Card) {
            this.card = payload;
        },
        setActivities(payload: PaginatedCardActivity) {
            this.activities = payload;
        },
        updateCard(payload: Card) {
            this.card = payload;
        },
        addCardActivity(payload: CardActivity) {
            this.activities?.data.unshift(CardAPI.parseCardActivity(payload));
        },
        addChecklist(payload: CardChecklist) {
            this.card?.checklists.push(payload);
        },
        removeChecklist(checklist_id: number) {
            const index = this.card?.checklists?.findIndex((el) => el.id == checklist_id) || -1;
            if (index > -1) {
                this.card?.checklists.splice(index, 1);
            }
        },
        addChecklistItem(item: ChecklistItem) {
            const checklist = this.card?.checklists.find((el) => el.id === item.checklist_id);
            if (checklist) {
                checklist.items.push(ChecklistAPI.parseChecklistItem(item));
            }
        },
        removeChecklistItem(deleteEvent: SIOChecklistItemDeleteEvent) {
            const checklist = this.card?.checklists.find((el) => el.id == deleteEvent.checklist_id);
            if (checklist) {
                const itemIndex = checklist.items.findIndex((el) => el.id == deleteEvent.entity_id) || -1;
                if (itemIndex > -1) checklist.items.splice(itemIndex, 1);
            }
        },
        updateChecklistItem(item: ChecklistItem) {
            const checklist = this.card?.checklists.find((el) => el.id == item.checklist_id);
            if (checklist) {
                const itemIndex = checklist.items.findIndex((el) => el.id == item.id);
                if (itemIndex > -1) checklist.items[itemIndex] = ChecklistAPI.parseChecklistItem(item);
            }

        },
        updateChecklist(list: CardChecklist) {
            const index = this.card?.checklists.findIndex((el) => el.id == list.id) || -1;
            if (this.card && index > -1) this.card.checklists[index] = list;
        },
        updateChecklistItemOrder(event: SIOChecklistItemUpdateOrder) {
            const checklist = this.card?.checklists.find((el) => el.id === event.checklist_id);
            if (checklist) {
                checklist.items.sort((a, b) => event.order.indexOf(a.id) - event.order.indexOf(b.id));
                checklist.items.forEach((el, index) => {
                    el.position = index;
                });
            }
        },
        unloadCard() {
            this.card = null;
            this.activities = null;
        },
        addCardAsisgnment(member: CardMember) {
            this.card?.assigned_members.push(member);
        },
        removeCardAssignment(member_id: number) {
            // Find card member
            const index = this.card?.assigned_members.findIndex((el) => el.id == member_id) || -1;
            if (index > -1) {
                this.card?.assigned_members.splice(index, 1);
            }
        },
        setCardMoved(value: boolean) {
            this.cardMoved = value;
        },
        addCardDate(item: CardDate) {
            this.card?.dates.push(item);
        },
        updateCardDate(item: CardDate) {
            const index = this.card?.dates.findIndex((el) => el.id == item.id) || -1;
            if (this.card && index > -1) {
                this.card.dates[index] = item;
            }
        },
        deleteCardDate(item_id: number) {
            const index = this.card?.dates.findIndex((el) => el.id == item_id) || -1;
            if (this.card && index > -1) {
                this.card.dates.splice(index, 1);
            }
        },
        updateCardActivity(activity: CardActivity) {
            const index = this.activities?.data.findIndex((el) => el.id == activity.id) || -1;
            if (this.activities && index > -1) {
                this.activities.data[index] = CardAPI.parseCardActivity(activity);
            }
        },
        deleteCardActivity(activity_id: number) {
            const index = this.activities?.data.findIndex((el) => el.id == activity_id) || -1;
            if (index > -1) {
                this.activities?.data.splice(index, 1);
            }
        },
        async loadCard(cardId: number) {
            try {
                this.setCard(await CardAPI.getCard(cardId));
                this.setActivities(await CardAPI.getCardActivities(cardId, { type: "all" }));
            }
            catch (err) {
                console.log(err);
            }
        },
    }
});