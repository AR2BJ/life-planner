import { StateManager } from "./state.model.js";

export const store = {
  get plans() {
    return StateManager.getPlans();
  },
  set plans(value) {
    StateManager.save(value, StateManager.getTags());
  },
  get tags() {
    return StateManager.getTags();
  },
  set tags(value) {
    StateManager.save(StateManager.getPlans(), value);
  },
};
