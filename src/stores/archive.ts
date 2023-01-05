import { defineStore } from "pinia";
import { ArchivedCard, ArchivedList } from "@/api/types";
import { BoardAPI } from "@/api/board";

export interface State {
    cards: ArchivedCard[];
    lists: ArchivedList[];
}

export const useArchiveStore = defineStore('archive', {
    state: (): State => ({
        cards: [],
        lists: []
    }),
    getters: {},
    actions: {
        setArchivedCards(value: ArchivedCard[]) {
            this.cards = value;
        },
        addArchivedCard(value: ArchivedCard) {
            this.cards.unshift(value);
        },
        removeArchivedCard(id: number) {
            const index = this.cards.findIndex((el) => el.id === id);
            if (index > -1) this.cards.splice(index, 1);
        },
        setArchivedLists(value: ArchivedList[]) {
            this.lists = value;
        },
        addArchivedList(value: ArchivedList) {
            this.lists.unshift(value);
        },
        removeArchivedList(id: number) {
            const index = this.lists.findIndex((el) => el.id === id);
            if (index > -1) this.lists.splice(index, 1);
        },
        async loadArchivedCards(boardId: number) {
            this.setArchivedCards(await BoardAPI.getArchivedCards(boardId));
        },
        async loadArchivedLists(boardId: number) {
            this.setArchivedLists(await BoardAPI.getArchivedLists(boardId));
        }
    }
});