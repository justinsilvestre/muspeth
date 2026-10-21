/** The state of a node combobox; a null query means the field shows the chosen node's name. */
export type NodeComboboxState = {
  query: string | null;
  isOpen: boolean;
  activeIndex: number;
};

type NodeComboboxAction =
  | { type: "typed"; query: string }
  | { type: "opened" }
  | { type: "movedBy"; offset: number; optionCount: number }
  | { type: "activated"; index: number }
  | { type: "escaped" }
  | { type: "chosen" }
  | { type: "left" };

export const closedComboboxState = {
  query: null,
  isOpen: false,
  activeIndex: 0,
} satisfies NodeComboboxState;

export function nodeComboboxReducer(state: NodeComboboxState, action: NodeComboboxAction) {
  switch (action.type) {
    case "typed":
      return { query: action.query, isOpen: true, activeIndex: 0 };
    case "opened":
      return { ...state, isOpen: true };
    case "movedBy":
      if (!state.isOpen) return { ...state, isOpen: true };
      return {
        ...state,
        activeIndex: clamp(state.activeIndex + action.offset, action.optionCount),
      };
    case "activated":
      return { ...state, activeIndex: action.index };
    case "escaped":
      return state.isOpen ? { ...state, isOpen: false } : { ...state, query: null };
    case "chosen":
    case "left":
      return closedComboboxState;
  }
}

function clamp(index: number, optionCount: number) {
  return Math.max(0, Math.min(index, optionCount - 1));
}
