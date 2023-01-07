import { defineStore } from "pinia";

import { ICard, IPaginatedCardActivity, ICardActivity, ICardChecklist, IChecklistItem, ICardMember, ICardDate, IDraftChecklistItem, IDraftCardMember } from "@/api/types";
import { CardAPI } from "@/api/card";
import { ChecklistAPI } from "@/api/checklist";
import { SIOChecklistItemDeleteEvent, SIOChecklistItemUpdateOrder } from "@/socket";

interface State {
    card: null | ICard;
    cardMoved: boolean;
    activities: null | IPaginatedCardActivity;
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
        setCard(payload: ICard) {
            this.card = payload;
        },
        setActivities(payload: IPaginatedCardActivity) {
            this.activities = payload;
        },
        addCardActivity(payload: ICardActivity) {
            if (this.activities && this.activities.data.findIndex((el) => el.id === payload.id) === -1)
                this.activities.data.unshift(CardAPI.parseCardActivity(payload));
        },
        addChecklist(payload: ICardChecklist) {
            if (this.card && !this.card.checklists.find((el) => el.id === payload.id))
                this.card.checklists.push(payload);
        },
        removeChecklist(checklist_id: number) {
            if (this.card) {
                const index = this.card.checklists.findIndex((el) => el.id == checklist_id);
                if (index > -1) {
                    this.card.checklists.splice(index, 1);
                }
            }
        },
        addChecklistItem(item: IChecklistItem) {
            const checklist = this.card?.checklists.find((el) => el.id === item.checklist_id);
            if (checklist) {
                // Check if item already exists
                if (checklist.items.findIndex((el) => el.id === item.id) === - 1)
                    checklist.items.push(ChecklistAPI.parseChecklistItem(item));
            }
        },
        removeChecklistItem(deleteEvent: SIOChecklistItemDeleteEvent) {
            const checklist = this.card?.checklists.find((el) => el.id == deleteEvent.checklist_id);
            if (checklist) {
                const itemIndex = checklist.items.findIndex((el) => el.id == deleteEvent.entity_id);
                if (itemIndex > -1) checklist.items.splice(itemIndex, 1);
            }
        },
        updateChecklistItem(item: IChecklistItem) {
            const checklist = this.card?.checklists.find((el) => el.id == item.checklist_id);
            if (checklist) {
                const itemIndex = checklist.items.findIndex((el) => el.id == item.id);
                if (itemIndex > -1) checklist.items[itemIndex] = ChecklistAPI.parseChecklistItem(item);
            }

        },
        updateChecklist(list: ICardChecklist) {
            if (this.card) {
                const index = this.card?.checklists.findIndex((el) => el.id == list.id);
                if (index > -1) this.card.checklists[index] = list;
            }
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
        addCardAsisgnment(member: ICardMember) {
            if (this.card && this.card.assigned_members.findIndex((el) => el.id === member.id) === -1)
                this.card.assigned_members.push(member);
        },
        removeCardAssignment(member_id: number) {
            // Find card member
            if (this.card) {
                const index = this.card.assigned_members.findIndex((el) => el.id == member_id);
                if (index > -1) {
                    this.card?.assigned_members.splice(index, 1);
                }
            }
        },
        setCardMoved(value: boolean) {
            this.cardMoved = value;
        },
        addCardDate(item: ICardDate) {
            this.card?.dates.push(item);
        },
        updateCardDate(item: ICardDate) {
            if (this.card) {
                const index = this.card.dates.findIndex((el) => el.id == item.id);
                if (index > -1) {
                    this.card.dates[index] = item;
                }
            }
        },
        deleteCardDate(item_id: number) {
            if (this.card) {
                const index = this.card.dates.findIndex((el) => el.id == item_id);
                if (index > -1) this.card.dates.splice(index, 1);
            }
        },
        updateCardActivity(activity: ICardActivity) {
            if (this.activities) {
                const index = this.activities.data.findIndex((el) => el.id == activity.id);
                if (this.activities && index > -1) {
                    this.activities.data[index] = CardAPI.parseCardActivity(activity);
                }
            }
        },
        deleteCardActivity(activity_id: number) {
            if (this.activities) {
                const index = this.activities.data.findIndex((el) => el.id == activity_id);
                if (index > -1) {
                    this.activities.data.splice(index, 1);
                }
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
        async postChecklist(item: Partial<ICardChecklist>) {
            if (this.card) {
                const newItem = await ChecklistAPI.postCardChecklist(this.card.id, item);
                this.addChecklist(newItem);
            }
        },
        async postChecklistItem(checklistId: number, item: IDraftChecklistItem) {
            const newItem = await ChecklistAPI.postChecklistItem(checklistId, item);
            this.addChecklistItem(newItem);
        },
        async patchCardCheckList(checklistId: number, checklist: Partial<ICardChecklist>) {
            const updatedItem = await ChecklistAPI.patchCardChecklist(checklistId, checklist);
            this.updateChecklist(updatedItem);
        },
        async postCardMemberAssignment(member: IDraftCardMember) {
            if (this.card) {
                const newItem = await CardAPI.assignCardMember(this.card.id, member);
                this.addCardAsisgnment(newItem);
            }
        }
    }
});