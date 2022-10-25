import SocketIO from 'socket.io-client';
import { BoardList, Card } from './api/types';

const options = { withCredentials: true, debug: true };
import store from "@/store/index";

export const useSocketIO = () => {
    const socket = SocketIO(process.env.VUE_APP_SOCKET_SERVER + "/board", options);
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
    CARD_USER_ASSIGNED = "card.user.assigned",
    CARD_USER_DEASSIGNED = "card.user.deassigned",

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

// Event listeners for Board namespace
export const SIOBoardEventListeners = {
    onError: (error: any) => {
        console.debug(`[Socket.IO]: Error ${JSON.stringify(error)}`);
    },
    onConnect: () => {
        console.debug(`[Socket.IO]: Connection to server: Board namespace`);
    },
    newCard: (data: Card) => {
        console.group("[Socket.IO]: New card");
        console.debug(data);
        console.debug("Saving new card if not exists");
        store.commit.board.saveNewCard(data);
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
        store.commit.board.saveNewList(data);
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
        // store.commit.board.saveNewList(data);
        store.commit.board.saveExistingList(data);
        console.groupEnd();
    },
    deleteList: (data: BoardList) => {
        console.group("[Socket.IO]: Delete list");
        console.debug(data);
        store.commit.board.removeList(data);
        console.groupEnd();
    }
};