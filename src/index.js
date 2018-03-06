import "babel-polyfill";

import IndexStore from "./store-ui/index";
import UI from "./ui";

import createSaga from "./saga";

const store = new IndexStore(createSaga);
store.tripStore.loadTripList();
UI({ store });

