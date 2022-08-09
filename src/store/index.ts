import { createDirectStore } from "direct-vuex";
import board from "./modules/board";
import auth from "./modules/auth";
import card from "./modules/card";

const {
    store,
    rootActionContext,
    moduleActionContext,
    rootGetterContext,
    moduleGetterContext
} = createDirectStore({
    modules: {
        board,
        auth,
        card
    }
});

// Export the direct-store instead of the classic Vuex store.
export default store;

// The following exports will be used to enable types in the
// implementation of actions and getters.
export {
    rootActionContext,
    moduleActionContext,
    rootGetterContext,
    moduleGetterContext
};

// The following lines enable types in the injected store '$store'.
export type AppStore = typeof store;
declare module "vuex" {
    interface Store<S> {
        direct: AppStore;
    }
}