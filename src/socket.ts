import SocketIO from 'socket.io-client';
import { BoardList, Card, CardActivity, CardChecklist, CardDate, CardMember, ChecklistItem } from './api/types';

const options = { withCredentials: true, debug: true };
import store from "@/store/index";


export const useSocketIO = () => {
    console.log("Create Socket.IO client");
    const socket = SocketIO(
        process.env.NODE_ENV === "development" ?
            process.env.VUE_APP_SOCKET_SERVER + "/board" :
            window.location.protocol + "//" + window.location.host + "/board", options);
    return {
        socket,
    };
};

export type CardEntity = "activity" | "date" | "member" | "checklist";

export enum SIOEvent {
    SIOError = "error",
    SIOConnect = "connect",
    SIODisconnect = "disconnect",

    CARD_NEW = "card.new",
    CARD_UPDATE = "card.update",
    CARD_DELETE = "card.delete",

    CARD_UPDATE_ORDER = "card.update.order",

    CARD_MEMBER_ASSIGNED = "card.member.assigned",
    CARD_MEMBER_DEASSIGNED = "card.member.deassigned",

    CARD_DATE_NEW = "card.date.new",
    CARD_DATE_UPDATE = "card.date.update",
    CARD_DATE_DELETE = "card.data.delete",

    CARD_CHECKLIST_NEW = "card.checklist.new",
    CARD_CHECKLIST_UPDATE = "card.checklist.update",
    CARD_CHECKLIST_DELETE = "card.checklist.delete",

    CHECKLIST_ITEM_NEW = "checklist.item.new",
    CHECKLIST_ITEM_UPDATE = "checklist.item.update",
    CHECKLIST_ITEM_DELETE = "checklist.item.delete",
    CHECKLIST_ITEM_UPDATE_ORDER = "checklist.item.update.order",

    CARD_ACTIVITY = "card.activity",

    LIST_NEW = "list.new",
    LIST_UPDATE_ORDER = "list.update.order",
    LIST_UPDATE = "list.update",
    LIST_DELETE = "list.delete",
}

export interface SIOCardUpdateOrder {
    list_id: number;
    order: number[];
}

export interface SIOChecklistItemUpdateOrder {
    card_id: number;
    checklist_id: number;
    order: number[];
}

export interface SIOCardMoved {
    card_id: number;
    from_list_id: number;
    to_list_id: number;
}

export interface SIOCardDate extends CardDate {
    list_id: number;
}


/*
Initial payload for Socket.IO events.
Helps frontend to find list and card by ID easier.
*/

export interface SIOCardEvent {
    list_id: number;
    card_id: number;
}

export interface SIODeleteEvent extends SIOCardEvent {
    entity_id: number;
}

export interface SIOCardMemberEvent extends SIOCardEvent {
    entity: CardMember;
}

export interface SIOCardUpdateEvent extends SIOCardEvent {
    entity: Card;
}

export interface SIOCardDateEvent extends SIOCardEvent {
    entity: SIOCardDate;
}

export interface SIOCardChecklistEvent extends SIOCardEvent {
    entity: CardChecklist;
}

export interface SIOChecklistItemEvent extends SIOCardEvent {
    entity: ChecklistItem;
}

export interface SIOChecklistItemDeleteEvent extends SIODeleteEvent {
    checklist_id: number;
}

// Event listeners for Board namespace
export const SIOBoardEventListeners = {
    onError: (error: any) => {
        console.debug(`[Socket.IO]: Error ${JSON.stringify(error)}`);
    },
    onConnect: () => {
        console.log("Connected to socket IO server");
    },
    newCard: (data: Card) => {
        console.group("[Socket.IO]: New card");
        console.debug(data);
        console.debug("Saving new card if not exists");
        store.commit.board.saveCard(data);
        console.groupEnd();
    },
    cardUpdate: (data: SIOCardUpdateEvent) => {
        console.group("[Socket.IO]: Card update");
        console.debug(data);

        console.debug("Update card on store");
        // If list_id changed move to other list on store aswell
        store.commit.board.SIOUpdateCard(data);
        // FIXME: This overwrites the whole card which is bad
        // if (store.state.card.card && store.state.card.card.id === data.card_id) {
        //     store.commit.card.setCard(data.entity);
        // }
        console.groupEnd();
    },
    cardOrderUpdate: (data: SIOCardUpdateOrder) => {
        console.group("[Socket.IO]: Card update order");
        console.debug(data);
        store.commit.board.updateCardOrder(data);
        console.groupEnd();
    },
    cardDelete: (data: SIODeleteEvent) => {
        console.group("[Socket.IO]: Card delete");
        console.debug("Remove from store");
        console.debug(data);
        store.commit.board.removeCard(data);
        console.groupEnd();
    },
    newList: (data: BoardList) => {
        console.group("[Socket.IO]: New list");
        console.debug(data);
        store.commit.board.saveList(data);
        console.groupEnd();
    },
    newCardDate: (cardDate: SIOCardDateEvent) => {
        console.group("[Socket.IO]: New card date");
        console.debug(cardDate);
        store.commit.board.SIOAddEntityToCard({
            event: { list_id: cardDate.list_id, card_id: cardDate.card_id },
            entityType: "date",
            entity: cardDate.entity
        });

        if (store.state.card.card && store.state.card.card.id == cardDate.card_id) {
            store.commit.card.addCardDate(cardDate.entity);
        }
        console.groupEnd();
    },
    updateCardDate: (cardDate: SIOCardDateEvent) => {
        console.group("[Socket.IO]: Update card date");
        console.debug(cardDate);
        store.commit.board.SIOUpdateCardEntity({
            event: { list_id: cardDate.list_id, card_id: cardDate.card_id },
            entityType: "date",
            entity: cardDate.entity
        });

        if (store.state.card.card && store.state.card.card.id == cardDate.card_id) {
            store.commit.card.updateCardDate(cardDate.entity);
        }
        console.groupEnd();

    },
    deleteCardDate: (cardDate: SIODeleteEvent) => {
        console.group("[Socket.IO]: Delete card date");
        console.debug(cardDate);
        store.commit.board.SIODeleteCardEntity({
            event: { list_id: cardDate.list_id, card_id: cardDate.card_id },
            entityType: "date",
            entity_id: cardDate.entity_id
        });

        if (store.state.card.card && store.state.card.card.id == cardDate.card_id) {
            store.commit.card.deleteCardDate(cardDate.entity_id);
        }
        console.groupEnd();
    },
    listUpdateOrder: (data: number[]) => {
        console.group("[Socket.IO]: Update list order");
        console.debug(data);
        store.commit.board.updateListOrder(data);
        console.groupEnd();
    },
    listUpdate: (data: BoardList) => {
        console.group("[Socket.IO]: Update list");
        console.debug(data);
        store.commit.board.saveList(data);
        console.groupEnd();
    },
    deleteList: (data: BoardList) => {
        console.group("[Socket.IO]: Delete list");
        console.debug(data);
        store.commit.board.removeList(data);
        console.groupEnd();
    },
    onCardActivity: (data: CardActivity) => {
        console.group(`[Socket.IO]: Card activity`);
        console.debug(data);
        store.commit.card.addCardActivity(data);
        console.groupEnd();
    },
    cardMemberAssigned: (data: SIOCardMemberEvent) => {
        console.group(`[Socket.IO]: Card member assignment`);
        console.log(data);
        // Add assignment to board assigned
        store.commit.board.SIOAddEntityToCard(
            {
                event: { list_id: data.list_id, card_id: data.card_id },
                entityType: "member",
                entity: data.entity
            }
        );
        // Add assignment to card if it's active
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.addCardAsisgnment(data.entity);
        }
        console.groupEnd();
    },
    cardMemberDeAssigned: (data: SIODeleteEvent) => {
        console.group(`[Socket.IO]: Card member deassignment`);
        console.log(data);
        store.commit.board.SIODeleteCardEntity({
            event: { list_id: data.list_id, card_id: data.card_id },
            entityType: "member",
            entity_id: data.entity_id
        });
        // Delete assignment to card if it's active
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.removeCardAssignment(data.entity_id);
        }
        console.groupEnd();
    },
    newCardChecklist: (data: SIOCardChecklistEvent) => {
        console.group(`[Socket.IO]: New checklist`);
        console.log(data);

        // TODO: We should implement Checklist state component for card.
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.addChecklist(data.entity);
        }
        console.groupEnd();
    },
    updateCardChecklist: (data: SIOCardChecklistEvent) => {
        console.group(`[Socket.IO]: Checklist updated`);
        console.log(data);

        // TODO: We should implement Checklist state component for card.
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.updateChecklist(data.entity);
        }
        console.groupEnd();
    },
    deleteCardChecklist: (data: SIODeleteEvent) => {
        console.group(`[Socket.IO]: Checklist delete`);
        console.log(data);

        // TODO: We should implement Checklist state component for card.
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.removeChecklist(data.entity_id);
        }
        console.groupEnd();
    },
    newChecklistItem: (data: SIOChecklistItemEvent) => {
        console.group(`[Socket.IO]: Checklist item create`);
        console.log(data);

        // TODO: We should implement Checklist state component for card.
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.addChecklistItem(data.entity);
        }
        console.groupEnd();
    },
    updateChecklistItem: (data: SIOChecklistItemEvent) => {
        console.group(`[Socket.IO]: Checklist item update`);
        console.log(data);

        // TODO: We should implement Checklist state component for card.
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.updateChecklistItem(data.entity);
        }
        console.groupEnd();
    },
    deleteChecklistItem: (data: SIOChecklistItemDeleteEvent) => {
        console.group(`[Socket.IO]: Checklist item delete`);
        console.log(data);

        // TODO: We should implement Checklist state component for card.
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.removeChecklistItem(data);
        }
        console.groupEnd();
    },
    updateChecklistItemOrder: (data: SIOChecklistItemUpdateOrder) => {
        console.group("[Socket.IO]: Checklist item update order");
        console.log(data);

        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.updateChecklistItemOrder(data);
        }
    }
};