import { ActionContext } from "vuex";
import { ArchivedCard, ArchivedList } from "@/api/types";
import { State } from "..";
import { CardState } from "./card";
import { BoardAPI } from "@/api/board";

export interface ArchiveState {
    cards: ArchivedCard[],
    lists: ArchivedList[];
}

type Context = ActionContext<CardState, State>;

export default {
    namespaced: true as const,
    state: {
        cards: [] as ArchivedCard[],
        lists: [] as ArchivedList[]
    },
    mutations: {
        setArchivedCards(state: ArchiveState, value: ArchivedCard[]) {
            state.cards = value;
        },
        addArchivedCard(state: ArchiveState, value: ArchivedCard) {
            state.cards.unshift(value);
        },
        removeArchivedCard(state: ArchiveState, id: number) {
            const index = state.cards.findIndex((el) => el.id === id);
            if (index > -1)
                state.cards.splice(index, 1);
        },
        setArchivedLists(state: ArchiveState, value: ArchivedList[]) {
            state.lists = value;
        },
        addArchivedList(state: ArchiveState, value: ArchivedList) {
            state.lists.unshift(value);
        },
        removeArchivedList(state: ArchiveState, id: number) {
            const index = state.lists.findIndex((el) => el.id === id);
            if (index > -1)
                state.lists.splice(index, 1);
        }
    },
    actions: {
        async loadArchivedCards(context: Context) {
            if (context.rootState.board.board) {
                const cards = await BoardAPI.getArchivedCards(context.rootState.board.board.id);
                context.commit("setArchivedCards", cards);
            }
        },
        async loadArchivedLists(context: Context) {
            if (context.rootState.board.board) {
                const cards = await BoardAPI.getArchivedLists(context.rootState.board.board.id);
                context.commit("setArchivedLists", cards);
            }
        }
    }
};