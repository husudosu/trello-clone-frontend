import { getBoard, getBoards, postBoard, deleteBoard, updateBoardListsOrder, getBoardClaims, getBoardRoles } from "@/api/board";
import { deleteBoardList, patchBoardList, postBoardList } from "@/api/boardList";
import { postCard } from "@/api/card";
import { Board, BoardClaims, BoardList, BoardRole, Card } from "@/api/types";


type InitialState = {
    boards: Board[];
    board: null | Board;
    claims: null | BoardClaims;
    roles: BoardRole[];
};

export default {
    namespaced: true as const,
    state: {
        board: null,
        boards: [],
        claims: null,
        roles: []
    } as InitialState,
    getters: {
        boardLists: (state: InitialState) => {
            return state.board?.lists;
        },
        hasPermission: (state: InitialState) => (permission: string) => {
            if (state.claims) {
                const obj = state.claims.role.permissions.find(p => p.name == permission);
                return obj?.allow == undefined ? false : obj?.allow;
            }
            return false;
        }
    },
    mutations: {
        setBoard(state: InitialState, board: Board) {
            state.board = board;
        },
        setBoards(state: InitialState, board: Board[]) {
            state.boards = board;
        },
        addBoard(state: InitialState, board: Board) {
            state.boards.push(board);
        },
        removeBoard(state: InitialState, boardId: number) {
            const itemIndex: number = state.boards.findIndex((el) => el.id == boardId);
            if (itemIndex > -1) {
                state.boards.splice(itemIndex, 1);
            }
        },
        setBoardClaims(state: InitialState, claims: BoardClaims) {
            state.claims = claims;
        },
        addNewList(state: InitialState) {
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
        saveNewList(state: InitialState, boardList: BoardList) {
            // Overwrite last list of board
            if (state.board !== null) {
                state.board.lists[state.board.lists.length - 1] = boardList;
            }
        },
        saveExistingList(state: InitialState, boardList: BoardList) {
            if (state.board !== null) {
                // Find board and overwrite it in store
                const index = state.board.lists.findIndex((el) => el.id == boardList.id);
                if (index > -1) {
                    state.board.lists[index] = boardList;
                }
            }
        },
        removeList(state: InitialState, boardList: BoardList) {
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
        addCard(state: InitialState, listId: number) {
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
        saveNewCard(state: InitialState, payload: { boardListId: number; card: Card; }) {
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
        removeCard(state: InitialState, payload: { boardListId: number; card: Card; }) {
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
        updateCard(state: InitialState, payload: { boardListId: number; card: Card; }) {
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
        setBoardRoles(state: InitialState, roles: BoardRole[]) {
            state.roles = roles;
        }
    },
    actions: {
        async loadBoard({ commit, dispatch }: any, payload: { boardId: number; }) {
            const board = await getBoard(payload.boardId);
            if (board) {
                // Load board claims too!
                commit("setBoard", board);
                await dispatch("loadBoardClaims");
                // Finaly load board roles too
                await dispatch("loadBoardRoles");
            }
            else {
                console.log("Board issue");
            }
        },
        async loadBoards({ commit }: any) {
            const data = await getBoards();
            commit("setBoards", data);
        },
        async loadBoardClaims({ commit, state }: any) {
            const data = await getBoardClaims(state.board.id);
            commit("setBoardClaims", data);
        },
        async loadBoardRoles({ commit, state }: any) {
            const data = await getBoardRoles(state.board.id);
            commit("setBoardRoles", data);
        },
        async createBoard({ commit }: any, payload: Partial<Board>) {
            const data = await postBoard(payload);
            commit("addBoard", data);
            return data;
        },
        async removeBoard({ commit }: any, boardId: number) {
            await deleteBoard(boardId);
            commit("removeBoard", boardId);
        },
        async saveBoardList({ commit, state }: any, list: BoardList) {
            if (list.id !== undefined) {
                // Update existing list
                const data = await patchBoardList(list.id, list);
                commit("saveExistingList", data);
            } else {
                // Create new list                
                const data = await postBoardList(state.board.id, list);
                commit("saveNewList", data);

                // Update order of boardlists
                await updateBoardListsOrder(state.board);
            }
        },
        async removeBoardList({ commit }: any, list: BoardList) {
            if (list.id)
                await deleteBoardList(list.id);
            commit("removeList", list);
        },
        async saveCard({ commit }: any, payload: { boardListId: number; card: Card; }) {
            const data = await postCard(payload.boardListId, payload.card);
            commit("saveNewCard", { boardListId: payload.boardListId, card: data });
        }
    }
};