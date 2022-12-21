import SocketIO from 'socket.io-client';
import { ArchivedCard, ArchivedList, BoardList, Card, CardActivity, CardChecklist, CardDate, CardMember, ChecklistItem } from './api/types';

const options = { withCredentials: true, debug: process.env.NODE_ENV === "development" };
import store from "@/store/index";
import { BoardAPI } from './api/board';
import { BoardListAPI } from './api/boardList';


export const useSocketIO = () => {
    console.log("Create Socket.IO client");
    const socket = SocketIO(
        process.env.NODE_ENV === "development" ? `${window.location.protocol}//${window.location.hostname}:${process.env.VUE_APP_BACKEND_PORT || 5000}/board` : window.location.protocol + "//" + window.location.host + "/board",
        options
    );
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
    CARD_REVERT = "card.revert",
    CARD_ARCHIVE = "card.archive",
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
    // These two currently used for only card comments
    CARD_ACTIVITY_UPDATE = "card.activity.update",
    CARD_ACTIVITY_DELETE = "card.activity.delete",

    LIST_NEW = "list.new",
    LIST_REVERT = "list.revert",
    LIST_UPDATE_ORDER = "list.update.order",
    LIST_UPDATE = "list.update",
    LIST_ARCHIVE = "list.archive",
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

export interface SIOCardArchiveEvent extends SIOCardEvent {
    entity: ArchivedCard;
}

export interface SIOCardUpdateEvent extends SIOCardEvent {
    entity: Card | Partial<Card>;
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
        store.commit.board.saveCard(data);
        console.groupEnd();
    },
    revertCard: (data: Card) => {
        console.group("[Socket.IO]: Revert card");
        console.debug(data);
        store.commit.archive.removeArchivedCard(data.id);

        store.commit.board.saveCard(data);
        // Reorder cards to get position correctly
        if (store.state.board.board) {
            const listId = store.state.board.board.lists.findIndex((el) => el.id === data.list_id);
            if (listId > -1) {
                store.state.board.board.lists[listId].cards.sort((a, b) => a.position - b.position);
            }
        }
        console.groupEnd();
    },
    cardUpdate: (data: SIOCardUpdateEvent) => {
        console.group("[Socket.IO]: Card update");
        console.debug(data);

        // If list_id changed move to other list on store aswell
        store.commit.board.SIOUpdateCard(data);
        if (store.state.card.card && store.state.card.card.id === data.card_id) {
            // FIXME: By some reason the entity always has an activities array. The API and Socket.IO emit not contains entity activities at all!
            delete data.entity.activities;
            store.commit.card.updateCard(data.entity);
        }
        console.groupEnd();
    },
    cardOrderUpdate: (data: SIOCardUpdateOrder) => {
        console.group("[Socket.IO]: Card update order");
        console.debug(data);
        store.commit.board.updateCardOrder(data);
        console.groupEnd();
    },
    cardArchive: (data: SIOCardArchiveEvent) => {
        console.group("[Socket.IO]: Card archive");
        console.debug("Remove from store");
        console.debug(data);
        store.commit.board.removeCard(data);
        store.commit.archive.addArchivedCard(BoardAPI.parseArchivedEntities(data.entity) as ArchivedCard);
        console.groupEnd();
    },
    cardDelete: (cardId: number) => {
        console.group("[Socket.IO]: Card delete");
        console.debug(cardId);
        store.commit.archive.removeArchivedCard(cardId);
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
    archiveList: (data: ArchivedList) => {
        console.group("[Socket.IO]: Archive list");
        console.debug(data);
        // TODO refactor board commit method to accept only ID.
        if (store.state.board.board) {
            const listItem = store.state.board.board.lists.find((el) => el.id == data.id);
            if (listItem) {
                store.commit.board.removeList(listItem);
            }
        }
        store.commit.archive.addArchivedList(BoardAPI.parseArchivedEntities(data) as ArchivedList);
        console.groupEnd();
    },
    revertList: (data: BoardList) => {
        console.group("[Socket.IO] Revert list");
        console.debug(data);
        // We should archived list cards too.
        // FIXME: By some reasons not removing all non-archived cards of list from archive store.
        store.state.archive.cards.forEach((el) => {
            if (el.board_list.id === data.id && !el.archived) {
                store.commit.archive.removeArchivedCard(el.id);
            }
        });
        store.commit.archive.removeArchivedList(data.id);
        store.commit.board.saveList(BoardListAPI.parseBoardList(data));

        // Sort Boardlists to get proper positions.
        store.state.board.board?.lists.sort((a, b) =>
            a.position - b.position
        );
    },
    deleteList: (listId: number) => {
        console.group("[Socket.IO] Delete list");
        console.debug(listId);
        store.commit.archive.removeArchivedList(listId);
        // We should remove archived list cards too. 
        store.state.archive.cards.forEach((el) => {
            if (el.board_list.id === listId) {
                store.commit.archive.removeArchivedCard(el.id);
            }
        });
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
        console.groupEnd();
    },
    updateCardActivity: (data: CardActivity) => {
        console.group("[Socket.IO]: Card activity update");
        console.log(data);
        store.commit.card.updateCardActivity(data);
        console.groupEnd();
    },
    deleteCardActivity: (data: number) => {
        console.group("[Socket.IO]: Card activity delete");
        console.log(data);
        store.commit.card.deleteCardActivity(data);
        console.groupEnd();
    }
};