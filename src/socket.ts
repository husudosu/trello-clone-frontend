import SocketIO from 'socket.io-client';
import { IArchivedCard, IArchivedList, IBoard, IBoardList, ICard, ICardActivity, ICardChecklist, ICardDate, ICardFileUpload, ICardMember, IChecklistItem } from './api/types';

const options = { withCredentials: true, debug: process.env.NODE_ENV === "development" };
import { BoardAPI } from './api/board';
import { BoardListAPI } from './api/boardList';
import router from './router';
import { Dialog } from 'quasar';
import { useCardStore } from './stores/card';
import { useArchiveStore } from './stores/archive';
import { useBoardStore } from './stores/board';


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
    SIOReconnect = "reconnect",

    BOARD_UPDATE = "board.update",
    BOARD_DELETE = "board.delete",

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

    FILE_UPLOAD = "file.upload",
    FILE_DELETE = "file.delete"

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

export interface SIOCardDate extends ICardDate {
    list_id: number;
}


/*
Initial payload for Socket.IO events.
Helps frontend to find list and card by ID easier.
*/

export interface SIOCardEvent {
    list_id: number;
    card_id: number;
    entity?: unknown;
}


export interface SIODeleteEvent extends SIOCardEvent {
    entity_id: number;
}

export interface SIOChecklistItemDeleteEvent extends SIODeleteEvent {
    checklist_id: number;
}


// Event listeners for Board namespace
export const SIOBoardEventListeners = {
    onError: (error: unknown) => {
        console.debug(`[Socket.IO->BoardPage]: Error ${JSON.stringify(error)}`);
    },
    onConnect: () => {
        console.log("Connected to socket IO server");
    },
    boardDelete: (boardID: number) => {
        console.group("[Socket.IO->BoardPage]: Board delete");
        console.debug(`Board delete ${boardID}`);
        console.groupEnd();
        Dialog.create({
            message: "Board has been deleted!"
        }).onDismiss(() => {
            router.push({ name: "dashboard" });
        });
    },
    boardUpdate: (board: Partial<IBoard>) => {
        const boardStore = useBoardStore();
        console.group("[Socket.IO->BoardPage]: Board update");
        console.debug(`Board archive ${board.id}`);
        // FIXME by some reasons we have to delete board.lists similar to cardUpdate listener.
        delete board.lists;

        boardStore.updateBoard(board);
        console.groupEnd();
    },
    newCard: (data: ICard) => {
        const boardStore = useBoardStore();
        console.group("[Socket.IO->BoardPage]: New card");
        console.debug(data);
        boardStore.saveCard(data);
        console.groupEnd();
    },
    revertCard: (data: ICard) => {
        const archiveStore = useArchiveStore();
        const boardStore = useBoardStore();
        console.group("[Socket.IO->BoardPage]: Revert card");
        console.debug(data);

        archiveStore.removeArchivedCard(data.id);

        boardStore.saveCard(data);
        // Reorder cards to get position correctly
        if (boardStore.board) {
            const listId = boardStore.board.lists.findIndex((el) => el.id === data.list_id);
            if (listId > -1) {
                boardStore.board.lists[listId].cards.sort((a, b) => a.position - b.position);
            }
        }
        console.groupEnd();
    },
    cardUpdate: (data: SIOCardEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        console.group("[Socket.IO->BoardPage]: Card update");
        console.debug(data);

        // If list_id changed move to other list on store aswell
        boardStore.SIOUpdateCard(data);
        if (cardStore.card?.id === data.card_id) {
            cardStore.setCard(data.entity as ICard);
        }

        console.groupEnd();
    },
    cardOrderUpdate: (data: SIOCardUpdateOrder) => {
        const boardStore = useBoardStore();
        console.group("[Socket.IO->BoardPage]: Card update order");
        console.debug(data);
        boardStore.updateCardOrder(data);
        console.groupEnd();
    },
    cardArchive: (data: SIOCardEvent) => {
        const boardStore = useBoardStore();
        const archiveStore = useArchiveStore();

        console.group("[Socket.IO->BoardPage]: Card archive");
        console.debug("Remove from store");
        console.debug(data);

        boardStore.removeCard(data);
        archiveStore.addArchivedCard(BoardAPI.parseArchivedEntities(data.entity as IArchivedCard) as IArchivedCard);

        console.groupEnd();
    },
    cardDelete: (cardId: number) => {
        const archiveStore = useArchiveStore();
        console.group("[Socket.IO->BoardPage]: Card delete");
        console.debug(cardId);
        archiveStore.removeArchivedCard(cardId);
    },
    newList: (data: IBoardList) => {
        const boardStore = useBoardStore();
        console.group("[Socket.IO->BoardPage]: New list");
        console.debug(data);
        boardStore.saveList(data);
        console.groupEnd();
    },
    newCardDate: (cardDate: SIOCardEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();

        console.group("[Socket.IO->BoardPage]: New card date");
        console.debug(cardDate);
        const entity = cardDate.entity as ICardDate;
        boardStore.SIOAddEntityToCard({
            event: { list_id: cardDate.list_id, card_id: cardDate.card_id },
            entityType: "date",
            entity
        });

        if (cardStore.card?.id === cardDate.card_id) {
            cardStore.addCardDate(entity);
        }
        console.groupEnd();
    },
    updateCardDate: (cardDate: SIOCardEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();

        console.group("[Socket.IO->BoardPage]: Update card date");
        console.debug(cardDate);

        const entity = cardDate.entity as ICardDate;

        boardStore.SIOUpdateCardEntity({
            event: { list_id: cardDate.list_id, card_id: cardDate.card_id },
            entityType: "date",
            entity
        });

        if (cardStore.card?.id === cardDate.card_id) {
            cardStore.updateCardDate(entity);
        }
        console.groupEnd();

    },
    deleteCardDate: (cardDate: SIODeleteEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        console.group("[Socket.IO->BoardPage]: Delete card date");
        console.debug(cardDate);
        boardStore.SIODeleteCardEntity({
            event: { list_id: cardDate.list_id, card_id: cardDate.card_id },
            entityType: "date",
            entity_id: cardDate.entity_id
        });

        if (cardStore.card?.id === cardDate.card_id) {
            cardStore.deleteCardDate(cardDate.entity_id);
        }
        console.groupEnd();
    },
    listUpdateOrder: (data: number[]) => {
        const boardStore = useBoardStore();
        console.group("[Socket.IO->BoardPage]: Update list order");
        console.debug(data);
        boardStore.updateListOrder(data);
        console.groupEnd();
    },
    listUpdate: (data: IBoardList) => {
        const boardStore = useBoardStore();
        console.group("[Socket.IO->BoardPage]: Update list");
        console.debug(data);
        boardStore.saveList(data);
        console.groupEnd();
    },
    archiveList: (data: IArchivedList) => {
        const boardStore = useBoardStore();
        const archiveStore = useArchiveStore();
        console.group("[Socket.IO->BoardPage]: Archive list");
        console.debug(data);
        // TODO refactor board commit method to accept only ID.
        if (boardStore.board) {
            const listItem = boardStore.board.lists.find((el) => el.id == data.id);
            if (listItem) {
                boardStore.removeList(listItem);
            }
        }
        archiveStore.addArchivedList(BoardAPI.parseArchivedEntities(data) as IArchivedList);
        console.groupEnd();
    },
    revertList: (data: IBoardList) => {
        const boardStore = useBoardStore();
        const archiveStore = useArchiveStore();
        console.group("[Socket.IO->BoardPage] Revert list");
        console.debug(data);
        // We should archived list cards too.
        // FIXME: By some reasons not removing all non-archived cards of list from archive store.
        archiveStore.cards.forEach((el) => {
            if (el.board_list.id === data.id && !el.archived) {
                archiveStore.removeArchivedCard(el.id);
            }
        });
        archiveStore.removeArchivedList(data.id);
        boardStore.saveList(BoardListAPI.parseBoardList(data));

        // Sort Boardlists to get proper positions.
        boardStore.board?.lists.sort((a, b) =>
            a.position - b.position
        );
    },
    deleteList: (listId: number) => {
        const archiveStore = useArchiveStore();

        console.group("[Socket.IO->BoardPage] Delete list");
        console.debug(listId);
        archiveStore.removeArchivedList(listId);
        // We should remove archived list cards too. 
        archiveStore.cards.forEach((el) => {
            if (el.board_list.id === listId) {
                archiveStore.removeArchivedCard(el.id);
            }
        });
    },
    onCardActivity: (data: ICardActivity) => {
        const cardStore = useCardStore();

        console.group(`[Socket.IO->BoardPage]: Card activity`);
        console.debug(data);
        cardStore.addCardActivity(data);
        console.groupEnd();
    },
    cardMemberAssigned: (data: SIOCardEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        console.group(`[Socket.IO->BoardPage]: Card member assignment`);
        console.log(data);
        // Add assignment to board assigned
        const entity = data.entity as ICardMember;
        boardStore.SIOAddEntityToCard(
            {
                event: { list_id: data.list_id, card_id: data.card_id },
                entityType: "member",
                entity
            }
        );
        // Add assignment to card if it's active
        if (cardStore.card?.id === data.card_id) {
            cardStore.addCardAsisgnment(entity);
        }
        console.groupEnd();
    },
    cardMemberDeAssigned: (data: SIODeleteEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        console.group(`[Socket.IO->BoardPage]: Card member deassignment`);
        console.log(data);
        boardStore.SIODeleteCardEntity({
            event: { list_id: data.list_id, card_id: data.card_id },
            entityType: "member",
            entity_id: data.entity_id
        });
        // Delete assignment to card if it's active
        if (cardStore.card?.id === data.card_id) {
            cardStore.removeCardAssignment(data.entity_id);
        }
        console.groupEnd();
    },
    newCardChecklist: (data: SIOCardEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        console.group(`[Socket.IO->BoardPage]: New checklist`);
        console.log(data);
        const entity = data.entity as ICardChecklist;

        if (cardStore.card?.id === data.card_id) {
            cardStore.addChecklist(entity);
        }
        boardStore.SIOAddEntityToCard({ event: data, entityType: "checklist", entity });
        console.groupEnd();
    },
    updateCardChecklist: (data: SIOCardEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        const entity = data.entity as ICardChecklist;
        console.group(`[Socket.IO->BoardPage]: Checklist updated`);
        console.log(data);

        if (cardStore.card?.id === data.card_id) {
            cardStore.updateChecklist(entity);
        }
        boardStore.SIOUpdateCardEntity({ event: data, entityType: "checklist", entity });
        console.groupEnd();
    },
    deleteCardChecklist: (data: SIODeleteEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        console.group(`[Socket.IO->BoardPage]: Checklist delete`);
        console.log(data);

        if (cardStore.card?.id === data.card_id) {
            cardStore.removeChecklist(data.entity_id);
        }
        boardStore.SIODeleteCardEntity({ event: data, entityType: "checklist", entity_id: data.entity_id });
        console.groupEnd();
    },
    newChecklistItem: (data: SIOCardEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        console.group(`[Socket.IO->BoardPage]: Checklist item create`);
        console.debug(data);
        const entity = data.entity as IChecklistItem;
        if (cardStore.card?.id === data.card_id) {
            console.debug("Add new checklist item to cardStore");
            cardStore.addChecklistItem(entity);
            console.debug(cardStore.card.checklists);
            console.debug("Checklist item add complete.");
        }
        console.debug("Adding new checklist item to board card aswell");
        boardStore.SIOAddChecklistItem(data);
        console.debug("End");
        console.debug(cardStore.card?.checklists);
        console.groupEnd();
    },
    updateChecklistItem: (data: SIOCardEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        console.group(`[Socket.IO->BoardPage]: Checklist item update`);
        console.log(data);

        if (cardStore.card?.id === data.card_id) {
            cardStore.updateChecklistItem(data.entity as IChecklistItem);
        }
        boardStore.SIOUpdateChecklistItem(data);
        console.groupEnd();
    },
    deleteChecklistItem: (data: SIOChecklistItemDeleteEvent) => {
        const cardStore = useCardStore();
        const boardStore = useBoardStore();
        console.group(`[Socket.IO->BoardPage]: Checklist item delete`);
        console.log(data);
        if (cardStore.card?.id === data.card_id) {
            cardStore.removeChecklistItem(data);
        }
        boardStore.SIODeleteChecklistItem(data);
        console.groupEnd();
    },
    updateChecklistItemOrder: (data: SIOChecklistItemUpdateOrder) => {
        const cardStore = useCardStore();
        console.group("[Socket.IO->BoardPage]: Checklist item update order");
        console.log(data);

        if (cardStore.card?.id === data.card_id) {
            cardStore.updateChecklistItemOrder(data);
        }
        console.groupEnd();
    },
    updateCardActivity: (data: ICardActivity) => {
        const cardStore = useCardStore();
        console.group("[Socket.IO->BoardPage]: Card activity update");
        console.log(data);
        cardStore.updateCardActivity(data);
        console.groupEnd();
    },
    deleteCardActivity: (data: number) => {
        const cardStore = useCardStore();
        console.group("[Socket.IO->BoardPage]: Card activity delete");
        console.log(data);
        cardStore.deleteCardActivity(data);
        console.groupEnd();
    },
    fileUpload: (data: SIOCardEvent) => {
        const cardStore = useCardStore();
        console.group(`[Socket.IO->CardDetailsDialog]: File added`);
        console.log(data);

        if (cardStore.card?.id === data.card_id) {
            cardStore.addFileUpload(data.entity as ICardFileUpload);
        }
        console.groupEnd();
    },
    fileDelete: (data: SIODeleteEvent) => {
        const cardStore = useCardStore();
        console.group(`[Socket.IO->CardDetailsDialog]: File deleted`);
        console.log(data);

        if (cardStore.card?.id === data.card_id) {
            cardStore.deleteFileUpload(data.entity_id);
        }
        console.groupEnd();

    }
};