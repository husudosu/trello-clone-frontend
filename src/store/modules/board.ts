import { ActionContext } from "vuex";
import { State } from "../index";

import { BoardAPI } from "@/api/board";
import { BoardListAPI } from "@/api/boardList";
import { CardAPI } from "@/api/card";
import { Board, BoardClaims, BoardList, BoardRole, Card, BoardPermission, DraftCard, DraftBoardList, BoardAllowedUser } from "@/api/types";

export interface BoardState {
    boards: Board[];
    board: null | Board;
    claims: null | BoardClaims;
    roles: BoardRole[];
    users: BoardAllowedUser[],
}

type Context = ActionContext<BoardState, State>;

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
            return state.board?.lists;
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
        }
    },
    mutations: {
        setBoard(state: BoardState, board: Board) {
            state.board = board;
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
        saveNewList(state: BoardState, boardList: BoardList) {
            if (state.board !== null) {
                state.board.lists.push(boardList);
            }
        },
        saveExistingList(state: BoardState, boardList: BoardList) {
            if (state.board !== null) {
                // Find board and overwrite it in store
                const index = state.board.lists.findIndex((el) => el.id == boardList.id);
                if (index > -1) {
                    state.board.lists[index] = boardList;
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
        saveNewCard(state: BoardState, card: Card) {
            if (state.board !== null) {
                // Find list
                const index = state.board.lists.findIndex((el) => el.id == card.list_id);
                if (index > -1) {
                    // Add new card to list.
                    state.board.lists[index].cards.push(card);
                }
            }
        },
        removeCard(state: BoardState, card: Card) {
            if (state.board !== null) {
                const listIndex = state.board.lists.findIndex((el) => el.id == card.list_id);
                if (listIndex > -1) {
                    const cardIndex = state.board.lists[listIndex].cards.findIndex((el) => el.id == card.id);
                    if (cardIndex > -1) {
                        state.board.lists[listIndex].cards.splice(cardIndex, 1);
                    }
                }
            }
        },
        updateCard(state: BoardState, card: Card) {
            // Updates card in board list.
            if (state.board !== null) {
                const listIndex = state.board.lists.findIndex((el) => el.id == card.list_id);
                if (listIndex > -1) {
                    // Find card  and update it
                    const cardIndex = state.board.lists[listIndex].cards.findIndex((el) => el.id == card.id);
                    if (cardIndex > -1) {
                        state.board.lists[listIndex].cards[cardIndex] = card;
                    }
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
        }
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
            context.commit("saveExistingList", data);
        },
        async newBoardList(context: Context, list: DraftBoardList) {
            if (context.state.board) {
                const data = await BoardListAPI.postBoardList(context.state.board.id, list);
                context.commit("saveNewList", data);
                // Update order of boardlists
                await BoardAPI.updateBoardListsOrder(context.state.board);
            }
        },
        async removeBoardList(context: Context, list: BoardList) {
            if (list.id)
                await BoardListAPI.deleteBoardList(list.id);
            context.commit("removeList", list);
        },
        async saveCard(context: Context, card: DraftCard) {
            const data = await CardAPI.postCard(card.list_id, card);
            context.commit("saveNewCard", data);
        }
    }
};