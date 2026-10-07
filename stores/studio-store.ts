import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_DESIGN, type Design, shuffleDesign } from "@/lib/design";
import { sanitizeDesign } from "@/lib/share";

const HISTORY_LIMIT = 60;

export type StudioTab =
  | "mark"
  | "color"
  | "card"
  | "site"
  | "checks"
  | "export";

interface StudioState {
  design: Design;
  /** Raw markup of the imported SVG. Kept out of share links: it is too big. */
  svgSource: string;
  past: Design[];
  /** Which tab of the controls is open. Checks can send the user to the right one. */
  tab: StudioTab;

  /** Continuous edits (typing, dragging a slider). Not undoable one by one. */
  update: (patch: Partial<Design>) => void;
  /** Discrete edits (picking a treatment, applying a fix). One undo step. */
  commit: (patch: Partial<Design>) => void;
  shuffle: () => void;
  undo: () => void;
  reset: () => void;
  setSvgSource: (source: string) => void;
  setTab: (tab: StudioTab) => void;
}

const remember = (state: StudioState) =>
  [...state.past, state.design].slice(-HISTORY_LIMIT);

export const useStudio = create<StudioState>()(
  persist(
    (set) => ({
      design: DEFAULT_DESIGN,
      svgSource: "",
      past: [],
      tab: "mark",

      update: (patch) =>
        set((state) => ({ design: { ...state.design, ...patch } })),
      commit: (patch) =>
        set((state) => ({
          past: remember(state),
          design: { ...state.design, ...patch },
        })),
      shuffle: () =>
        set((state) => ({
          past: remember(state),
          design: shuffleDesign(state.design),
        })),
      undo: () =>
        set((state) =>
          state.past.length === 0
            ? state
            : {
                design: state.past[state.past.length - 1],
                past: state.past.slice(0, -1),
              },
        ),
      reset: () =>
        set((state) => ({ past: remember(state), design: DEFAULT_DESIGN })),
      setSvgSource: (svgSource) => set({ svgSource }),
      setTab: (tab) => set({ tab }),
    }),
    {
      name: "underscore:studio",
      version: 2,
      // The server renders the default design; stored work is applied after
      // mount so the first client render matches and hydration stays clean.
      skipHydration: true,
      partialize: ({ design, svgSource }) => ({ design, svgSource }),
      merge: (persisted, current) => {
        const stored = (persisted ?? {}) as Partial<StudioState>;
        return {
          ...current,
          design: sanitizeDesign(stored.design),
          svgSource:
            typeof stored.svgSource === "string" ? stored.svgSource : "",
        };
      },
    },
  ),
);

export const useDesign = () => useStudio((state) => state.design);
