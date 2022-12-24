import { ActionContext } from "vuex";
import { State } from "../index";

import { BoardAPI } from "@/api/board";
import { BoardListAPI } from "@/api/boardList";
import { CardAPI } from "@/api/card";
import { Board, BoardClaims, BoardList, BoardRole, Card, BoardPermission, DraftBoardList, BoardAllowedUser, CardDate, CardMember, CardChecklist } from "@/api/types";
import { SIOCardUpdateOrder, SIOCardUpdateEvent, CardEntity, SIOCardEvent, SIOCardArchiveEvent, SIOChecklistItemEvent, SIOChecklistItemDeleteEvent } from "@/socket";
export interface BoardState {
    boards: Board[];
    board: null | Board;
    claims: null | BoardClaims;
    roles: BoardRole[];
    users: BoardAllowedUser[],
}

type Context = ActionContext<BoardState, State>;

interface CardPositionInBoard {
    listIndex: number;
    cardIndex: number;
}

/**
 * Find card index on boards
 * 
 * @param lists 
 * @param listId 
 * @param cardId 
 * @returns Found index or throws an error.
 */
const findCardIndex = (lists: BoardList[], listId: number, cardId: number): CardPositionInBoard => {
    const listIndex = lists.findIndex((el) => el.id === listId);

    if (listIndex > -1) {
        const cardIndex = lists[listIndex].cards.findIndex((el) => el.id === cardId);

        if (cardIndex > -1) return { listIndex, cardIndex };
        else throw "Card index of card not found!";
    }
    else throw "List index of card not found!";
};

export default {
    namespaced: true as const,
    state: {
        board: null,
        boards: [],
        claims: null,
        roles: [],
        users: [],
    } as BoardState,
    getters: {
        boardLists: (state: BoardState) => {
            return state.board?.lists || [];
        },
        hasPermission: (state: BoardState) => (permission: BoardPermission) => {
            if (state.claims) {
                const obj = state.claims.role.permissions.find(p => p.name == permission);
                return obj?.allow == undefined ? false : obj?.allow;
            }
            return false;
        },
        isAdmin: (state: BoardState) => {
            if (state.claims)
                return state.claims.role.is_admin;
        },
        boardUser: (state: BoardState) => {
            if (state.claims) {
                return state.claims;
            }
        },
        getBoardUsername: (state: BoardState) => (boardUserId: number) => {
            const user = state.users.find((el) => el.id == boardUserId);
            return user ? user.user.name || user.user.username : "";
        },
        owner: (state: BoardState) => {
            return state.users.find((el) => el.is_owner);
        }
    },
    mutations: {
        setBoard(state: BoardState, board: Board) {
            state.board = board;
        },
        updateBoard(state: BoardState, board: Partial<Board>) {
            if (state.board)
                state.board = Object.assign(state.board, board as Board);
        },
        setBoards(state: BoardState, board: Board[]) {
            state.boards = board;
        },
        addBoard(state: BoardState, board: Board) {
            state.boards.push(board);
        },
        removeBoard(state: BoardState, boardId: number) {
            const itemIndex: number = state.boards.findIndex((el) => el.id == boardId);
            if (itemIndex > -1) {
                state.boards.splice(itemIndex, 1);
            }
        },
        setBoardClaims(state: BoardState, claims: BoardClaims) {
            state.claims = claims;
        },
        saveList(state: BoardState, boardList: BoardList) {
            if (state.board !== null) {
                // Check if exists
                const index = state.board.lists.findIndex((el) => el.id === boardList.id);

                if (index === -1) {
                    state.board.lists.push(boardList);
                } else {
                    state.board.lists[index] = Object.assign(state.board.lists[index], boardList);
                }
            }
        },
        removeList(state: BoardState, boardList: BoardList) {
            if (state.board !== null) {
                if (boardList.id) {
                    // Delete existing
                    const listIndex = state.board.lists.findIndex((el) => el.id == boardList.id);
                    if (listIndex > -1) {
                        state.board.lists.splice(listIndex, 1);
                    }
                }
                else {
                    // Delete draft
                    state.board.lists.splice(state.board.lists.length - 1, 1);
                }
            }
        },
        saveCard(state: BoardState, card: Card) {
            if (state.board !== null) {
                // Find list
                const listIndex = state.board.lists.findIndex((el) => el.id == card.list_id);

                if (listIndex > -1) {
                    // Check if card already exists.
                    const cardId = state.board.lists[listIndex].cards.findIndex((el) => el.id == card.id);

                    // Not exists on store yet (Required for Socket IO client)
                    if (cardId === -1) {
                        state.board.lists[listIndex].cards.push(card);
                    } else {
                        state.board.lists[listIndex].cards[cardId] = card;
                    }
                }
            }
        },
        removeCard(state: BoardState, ev: SIOCardArchiveEvent) {
            if (state.board !== null) {
                const cardPos = findCardIndex(state.board.lists, ev.list_id, ev.card_id);
                state.board.lists[cardPos.listIndex].cards.splice(cardPos.cardIndex, 1);
            }
        },
        SIOAddEntityToCard(state: BoardState, payload: { event: SIOCardEvent, entityType: CardEntity, entity: unknown; }) {
            if (state.board) {
                const cPos = findCardIndex(state.board.lists, payload.event.list_id, payload.event.card_id);
                switch (payload.entityType) {
                    case "date":
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].dates.push(
                            CardAPI.parseCardDate(payload.entity as CardDate)
                        );
                        break;
                    case "member":
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].assigned_members.push(payload.entity as CardMember);
                        break;
                    case "checklist":
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists.push(payload.entity as CardChecklist);
                        break;
                }
            }
        },
        SIOUpdateCardEntity(state: BoardState, payload: { event: SIOCardEvent, entityType: CardEntity, entity: unknown; }) {
            if (state.board) {
                const cPos = findCardIndex(state.board.lists, payload.event.list_id, payload.event.card_id);

                if (payload.entityType === "date") {
                    const entity = payload.entity as CardDate;
                    const entityIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].dates
                        .findIndex((el) => el.id == entity.id);

                    if (entityIndex > -1) {
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].dates[entityIndex] = CardAPI.parseCardDate(entity);
                    }
                }
                else if (payload.entityType === "member") {
                    const entity = payload.entity as CardMember;
                    const entityIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].assigned_members
                        .findIndex((el) => el.id == entity.id);

                    if (entityIndex > -1) {
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].assigned_members[entityIndex] = entity;
                    }
                }
                else if (payload.entityType === "checklist") {
                    const entity = payload.entity as CardChecklist;
                    const entityIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists
                        .findIndex((el) => el.id == entity.id);
                    if (entityIndex > -1) {
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists[entityIndex] = entity;
                    }
                }
            }
        },
        SIODeleteCardEntity(state: BoardState, payload: { event: SIOCardEvent, entityType: CardEntity, entity_id: number; }) {
            if (state.board) {
                const cPos = findCardIndex(state.board.lists, payload.event.list_id, payload.event.card_id);

                if (payload.entityType === "date") {
                    const entityIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].dates.findIndex(
                        (el) => el.id === payload.entity_id);
                    if (entityIndex > -1)
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].dates.splice(entityIndex, 1);
                }
                else if (payload.entityType === "member") {
                    const entityIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].assigned_members.findIndex(
                        (el) => el.id === payload.entity_id);
                    if (entityIndex > -1)
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].assigned_members.splice(entityIndex, 1);
                }
                else if (payload.entityType === "checklist") {
                    const entityIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists.findIndex(
                        (el) => el.id === payload.entity_id);
                    if (entityIndex > -1)
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists.splice(entityIndex, 1);
                }
            }
        },
        SIOUpdateCard(state: BoardState, payload: SIOCardUpdateEvent) {
            if (state.board !== null) {
                const listIndex = state.board.lists.findIndex((el) => el.id == payload.list_id);
                if (listIndex > -1) {
                    // Find card  and update it
                    const cardIndex = state.board.lists[listIndex].cards.findIndex((el) => el.id == payload.entity.id);
                    if (cardIndex > -1) {
                        if (payload.list_id === payload.entity.list_id) {
                            // Just update the card
                            // FIXME: We don't recieve activites from API on update so we have to do this. Not fancy.
                            const updatedCard = payload.entity as Card;
                            updatedCard.activities = [];
                            state.board.lists[listIndex].cards[cardIndex] = CardAPI.parseCard(updatedCard);
                        }
                        else {
                            // We have to move the card to other list
                            // Delete from original list if card list have changed 
                            state.board.lists[listIndex].cards.splice(cardIndex, 1);
                            // And put it on the new list.
                            const newListIndex = state.board.lists.findIndex((el) => el.id === payload.entity.list_id);
                            if (newListIndex > -1) {
                                // FIXME: We don't recieve activites from API on update so we have to do this. Not fancy.
                                const updatedCard = payload.entity as Card;
                                updatedCard.activities = [];

                                state.board.lists[newListIndex].cards.push(CardAPI.parseCard(updatedCard));
                            }
                        }
                    }
                }
            }
        },
        SIOAddChecklistItem(state: BoardState, payload: SIOChecklistItemEvent) {
            if (state.board !== null) {
                const cPos = findCardIndex(state.board.lists, payload.list_id, payload.card_id);

                // Find checklist.
                const checklistIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists.findIndex(
                    (el) => el.id === payload.entity.checklist_id);
                if (checklistIndex > -1) {
                    console.log(checklistIndex);
                    state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists[checklistIndex].items.push(payload.entity);
                }
            }
        },
        SIOUpdateChecklistItem(state: BoardState, payload: SIOChecklistItemEvent) {
            if (state.board !== null) {
                const cPos = findCardIndex(state.board.lists, payload.list_id, payload.card_id);
                // Find checklist.
                const checklistIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists.findIndex(
                    (el) => el.id === payload.entity.checklist_id);
                if (checklistIndex > -1) {
                    // Find item index
                    const itemIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists[checklistIndex].items.findIndex(
                        (el) => el.id === payload.entity.id);

                    if (itemIndex > -1) {
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists[checklistIndex].items[itemIndex] = payload.entity;
                    }
                }
            }
        },
        SIODeleteChecklistItem(state: BoardState, payload: SIOChecklistItemDeleteEvent) {
            if (state.board !== null) {
                const cPos = findCardIndex(state.board.lists, payload.list_id, payload.card_id);
                const checklistIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists.findIndex(
                    (el) => el.id === payload.checklist_id);
                if (checklistIndex > -1) {
                    // Find item index
                    const itemIndex = state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists[checklistIndex].items.findIndex(
                        (el) => el.id === payload.entity_id);

                    if (itemIndex > -1)
                        state.board.lists[cPos.listIndex].cards[cPos.cardIndex].checklists[checklistIndex].items.splice(itemIndex, 1);
                }
            }
        },
        setBoardRoles(state: BoardState, roles: BoardRole[]) {
            state.roles = roles;
        },
        setBoardUsers(state: BoardState, users: BoardAllowedUser[]) {
            state.users = users;
        },
        unLoadBoard(state: BoardState) {
            state.board = null;
            state.claims = null;
            state.roles = [];
            state.users = [];
        },
        setLists(state: BoardState, lists: BoardList[]) {
            if (state.board) {
                state.board.lists = lists;
            }
        },
        setCards(state: BoardState, payload: { cards: Card[], listId: number; }) {
            if (state.board) {
                const listIndex = state.board.lists.findIndex((el) => el.id == payload.listId);

                if (listIndex > -1) {
                    state.board.lists[listIndex].cards = payload.cards;
                }
            }
        },
        updateListOrder(state: BoardState, orderOfIds: number[]) {
            if (state.board) {
                state.board.lists.sort((a, b) => orderOfIds.indexOf(a.id) - orderOfIds.indexOf(b.id));
                // Update position data. FIXME: We need better method for this.
                state.board.lists.forEach((el, index) => {
                    el.position = index;
                });
            }
        },
        updateCardOrder(state: BoardState, payload: SIOCardUpdateOrder) {
            if (state.board) {
                // Find list
                const listIndex = state.board.lists.findIndex((el) => el.id === payload.list_id);

                if (listIndex > -1) {
                    state.board.lists[listIndex].cards.sort((a, b) => payload.order.indexOf(a.id) - payload.order.indexOf(b.id));
                    // Update position data. FIXME: We need better method for this.
                    state.board.lists[listIndex].cards.forEach((el, index) => {
                        el.position = index;
                    });
                }

            }
        },
    },
    actions: {
        async loadBoard(context: Context, payload: { boardId: number; }) {
            const board = await BoardAPI.getBoard(payload.boardId);
            if (board) {
                // Load board claims too!
                context.commit("setBoard", board);
                await context.dispatch("loadBoardClaims");
                // Load board roles too
                await context.dispatch("loadBoardRoles");
                // Load board users
                await context.dispatch("loadBoardUsers");
            }
            else {
                console.log("Board issue");
            }
        },
        async loadBoards(context: Context) {
            const data = await BoardAPI.getBoards();
            context.commit("setBoards", data);
        },
        async loadBoardClaims(context: Context) {
            if (context.state.board) {
                const data = await BoardAPI.getBoardClaims(context.state.board.id);
                context.commit("setBoardClaims", data);
            }
        },
        async loadBoardRoles(context: Context) {
            if (context.state.board) {
                const data = await BoardAPI.getBoardRoles(context.state.board.id);
                context.commit("setBoardRoles", data);
            }
        },
        async loadBoardUsers(context: Context) {
            if (context.state.board) {
                const data = await BoardAPI.getBoardMembers(context.state.board.id);
                context.commit("setBoardUsers", data);
            }
        },
        async createBoard(context: Context, payload: Partial<Board>) {
            const data = await BoardAPI.postBoard(payload);
            context.commit("addBoard", data);
            return data;
        },
        async removeBoard(context: Context, boardId: number) {
            await BoardAPI.deleteBoard(boardId);
            context.commit("removeBoard", boardId);
        },
        async updateBoardList(context: Context, list: BoardList) {
            // Update existing list
            const data = await BoardListAPI.patchBoardList(list.id, list);
            context.commit("saveList", data);
        },
        async newBoardList(context: Context, list: DraftBoardList) {
            if (context.state.board) {
                const data = await BoardListAPI.postBoardList(context.state.board.id, list);
                context.commit("saveList", data);
                // Update order of boardlists
                await BoardAPI.updateBoardListsOrder(context.state.board);
            }
        },
        async removeBoardList(context: Context, list: BoardList) {
            if (list.id)
                await BoardListAPI.deleteBoardList(list.id);
            context.commit("removeList", list);
        },
    }
};