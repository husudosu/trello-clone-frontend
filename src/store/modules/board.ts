import { getBoard, getBoards, postBoard, deleteBoard, updateBoardListsOrder } from "@/api/board";
import { deleteBoardList, patchBoardList, postBoardList } from "@/api/boardList";
import { postCard } from "@/api/card";
import { Board, BoardList, Card } from "@/api/types";


type InitialState = {
    boards: Board[];
    board: null | Board;
};

export default {
    namespaced: true as const,
    state: {
        board: null,
        boards: [],
        lists: []
    } as InitialState,
    getters: {
        boardLists: (state: InitialState) => {
            return state.board?.lists;
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
        }
    },
    actions: {
        async loadBoard({ commit }: any, payload: { boardId: number; }) {
            const board = await getBoard(payload.boardId);
            if (board) {
                commit("setBoard", board);
            }
            else {
                console.log("Board issue");
            }
        },
        async loadBoards({ commit }: any) {
            const data = await getBoards();
            commit("setBoards", data);
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