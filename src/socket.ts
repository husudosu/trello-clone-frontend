import SocketIO from 'socket.io-client';
import { BoardList, Card, CardActivity, CardDate, CardMember } from './api/types';

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


export enum SIOEvent {
    SIOError = "error",
    SIOConnect = "connect",

    CARD_NEW = "card.new",
    CARD_UPDATE = "card.update",
    CARD_DELETE = "card.delete",

    CARD_UPDATE_ORDER = "card.update.order",

    CARD_MEMBER_ASSIGNED = "card.member.assigned",
    CARD_MEMBER_DEASSIGNED = "card.member.deassigned",

    CARD_DATE_NEW = "card.date.new",
    CARD_DATE_UPDATE = "card.date.update",
    CARD_DATE_DELETE = "card.data.delete",

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

export interface SIOCardMoved {
    card_id: number;
    from_list_id: number;
    to_list_id: number;
}

export interface SIOCardUpdatePayload {
    card: Card;
    from_list_id: number; // Check if card list_id changed
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

export interface SIOCardMemberEvent extends SIOCardEvent {
    entity: CardMember;
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
    cardUpdate: (data: SIOCardUpdatePayload) => {
        console.group("[Socket.IO]: Card update");
        console.debug(data);

        console.debug("Update card on store");
        // If list_id changed move to other list on store aswell
        store.commit.board.SIOUpdateCard(data);
        console.groupEnd();
    },
    cardOrderUpdate: (data: SIOCardUpdateOrder) => {
        console.group("[Socket.IO]: Card update order");
        console.debug(data);
        store.commit.board.updateCardOrder(data);
        console.groupEnd();
    },
    cardDelete: (data: Card) => {
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
    newCardDate: (cardDate: SIOCardDate) => {
        console.group("[Socket.IO]: New card date");
        console.debug(cardDate);
        store.commit.board.SIOHandleCardDate({ cardDate, delete: false });
        console.groupEnd();
    },
    updateCardDate: (cardDate: SIOCardDate) => {
        console.group("[Socket.IO]: Update card date");
        console.debug(cardDate);
        store.commit.board.SIOHandleCardDate({ cardDate, delete: false });
        console.groupEnd();

    },
    deleteCardDate: (cardDate: SIOCardDate) => {
        console.group("[Socket.IO]: Delete card date");
        console.debug(cardDate);
        store.commit.board.SIOHandleCardDate({ cardDate, delete: true });
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
        store.commit.board.SIOHandleCardMember({ data, delete: false });

        // Add assignment to card if it's active
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.addCardAsisgnment(data.entity);
        }
        console.groupEnd();
    },
    cardMemberDeAssigned: (data: SIOCardMemberEvent) => {
        console.group(`[Socket.IO]: Card member deassignment`);
        console.log(data);
        store.commit.board.SIOHandleCardMember({ data, delete: true });

        // Delete assignment to card if it's active
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            store.commit.card.removeCardAssignment(data.entity);
        }
        console.groupEnd();
    }
};