import { ActionContext } from "vuex";
import { State } from "../index";

import { getBoard, getBoards, postBoard, deleteBoard, updateBoardListsOrder, getBoardClaims, getBoardRoles } from "@/api/board";
import { deleteBoardList, patchBoardList, postBoardList } from "@/api/boardList";
import { postCard } from "@/api/card";
import { Board, BoardClaims, BoardList, BoardRole, Card, BoardPermission } from "@/api/types";

export interface BoardState {
    boards: Board[];
    board: null | Board;
    claims: null | BoardClaims;
    roles: BoardRole[];
}

type Context = ActionContext<BoardState, State>;

export default {
    namespaced: true as const,
    state: {
        board: null,
        boards: [],
        claims: null,
        roles: []
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
        addNewList(state: BoardState) {
            // Creates only a placeholder for new list.
            if (state.board) {
                state.board.lists.push({
                    board_id: state.board.id,
                    title: "",
                    position: 1,
                    cards: []
                });
            }
        },
        saveNewList(state: BoardState, boardList: BoardList) {
            // Overwrite last list of board
            if (state.board !== null) {
                state.board.lists[state.board.lists.length - 1] = boardList;
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
        addCard(state: BoardState, listId: number) {
            // Adds a placeholder card to list.

            // Find list first
            if (state.board != null) {
                const index = state.board.lists.findIndex((el) => el.id == listId);

                if (index > -1) {
                    state.board.lists[index].cards?.push({
                        list_id: listId,
                    });
                }
            }
        },
        saveNewCard(state: BoardState, payload: { boardListId: number; card: Card; }) {
            if (state.board !== null) {
                // Find list
                const index = state.board.lists.findIndex((el) => el.id == payload.boardListId);
                if (index > -1) {
                    if (state.board.lists[index]) {
                        // Overwrite last item of board list card entry
                        state.board.lists[index].cards[state.board.lists[index].cards.length - 1] = payload.card;
                    }
                }
            }
        },
        removeCard(state: BoardState, payload: { boardListId: number; card: Card; }) {
            if (state.board !== null) {
                const listIndex = state.board.lists.findIndex((el) => el.id == payload.boardListId);
                if (payload.card.id) {
                    const cardIndex = state.board.lists[listIndex].cards.findIndex((el) => el.id == payload.card.id);
                    if (cardIndex > -1) {
                        state.board.lists[listIndex].cards.splice(cardIndex, 1);
                    }
                }
                else {
                    // If card id is undefined, remove draft item aka. last  item of list
                    state.board.lists[listIndex].cards.splice(state.board.lists[listIndex].cards.length - 1, 1);
                }
            }
        },
        updateCard(state: BoardState, payload: { boardListId: number; card: Card; }) {
            if (state.board !== null) {
                const listIndex = state.board.lists.findIndex((el) => el.id == payload.boardListId);
                if (listIndex > -1) {
                    // Find card  and update it
                    const cardIndex = state.board.lists[listIndex].cards.findIndex((el) => el.id == payload.card.id);
                    if (cardIndex > -1) {
                        state.board.lists[listIndex].cards[cardIndex] = payload.card;
                    }
                }
            }
        },
        setBoardRoles(state: BoardState, roles: BoardRole[]) {
            state.roles = roles;
        },
        unLoadBoard(state: BoardState) {
            console.log("Unload");
            state.board = null;
            state.claims = null;
            state.roles = [];
        }
    },
    actions: {
        async loadBoard(context: Context, payload: { boardId: number; }) {
            const board = await getBoard(payload.boardId);
            if (board) {
                // Load board claims too!
                context.commit("setBoard", board);
                await context.dispatch("loadBoardClaims");
                // Finaly load board roles too
                await context.dispatch("loadBoardRoles");
            }
            else {
                console.log("Board issue");
            }
        },
        async loadBoards(context: Context) {
            const data = await getBoards();
            context.commit("setBoards", data);
        },
        async loadBoardClaims(context: Context) {
            if (context.state.board) {
                const data = await getBoardClaims(context.state.board.id);
                context.commit("setBoardClaims", data);
            }
        },
        async loadBoardRoles(context: Context) {
            if (context.state.board) {
                const data = await getBoardRoles(context.state.board.id);
                context.commit("setBoardRoles", data);
            }
        },
        async createBoard(context: Context, payload: Partial<Board>) {
            const data = await postBoard(payload);
            context.commit("addBoard", data);
            return data;
        },
        async removeBoard(context: Context, boardId: number) {
            await deleteBoard(boardId);
            context.commit("removeBoard", boardId);
        },
        async saveBoardList(context: Context, list: BoardList) {
            if (list.id !== undefined) {
                // Update existing list
                const data = await patchBoardList(list.id, list);
                context.commit("saveExistingList", data);
            } else {
                // Create new list
                if (context.state.board) {
                    const data = await postBoardList(context.state.board.id, list);
                    context.commit("saveNewList", data);

                    // Update order of boardlists
                    await updateBoardListsOrder(context.state.board);
                }
            }
        },
        async removeBoardList(context: Context, list: BoardList) {
            if (list.id)
                await deleteBoardList(list.id);
            context.commit("removeList", list);
        },
        async saveCard(context: Context, payload: { boardListId: number; card: Card; }) {
            const data = await postCard(payload.boardListId, payload.card);
            context.commit("saveNewCard", { boardListId: payload.boardListId, card: data });
        }
    }
};