import { create } from "zustand";
import { GRID_SIZE } from "./tile-grid-config";

interface TileState {
  // Map of tile index (1-64) to loaded texture URL
  loadedTiles: Map<number, string>;
  // Set of currently loading tiles
  loadingTiles: Set<number>;
  // Track which tiles have been requested
  requestedTiles: Set<number>;
}

interface TileStoreActions {
  markTileLoading: (index: number) => void;
  markTileLoaded: (index: number, textureUrl: string) => void;
  markTileError: (index: number) => void;
  isTileLoaded: (index: number) => boolean;
  isTileLoading: (index: number) => boolean;
  getTileTexture: (index: number) => string | undefined;
  requestTiles: (indices: number[]) => number[];
  reset: () => void;
}

type TileStore = TileState & TileStoreActions;

const initialState: TileState = {
  loadedTiles: new Map(),
  loadingTiles: new Set(),
  requestedTiles: new Set(),
};

export const useTileStore = create<TileStore>((set, get) => ({
  ...initialState,

  markTileLoading: (index: number) => {
    set((state) => {
      const newLoadingTiles = new Set(state.loadingTiles);
      newLoadingTiles.add(index);
      return { loadingTiles: newLoadingTiles };
    });
  },

  markTileLoaded: (index: number, textureUrl: string) => {
    set((state) => {
      const newLoadedTiles = new Map(state.loadedTiles);
      const newLoadingTiles = new Set(state.loadingTiles);
      newLoadedTiles.set(index, textureUrl);
      newLoadingTiles.delete(index);
      return {
        loadedTiles: newLoadedTiles,
        loadingTiles: newLoadingTiles,
      };
    });
  },

  markTileError: (index: number) => {
    set((state) => {
      const newLoadingTiles = new Set(state.loadingTiles);
      const newRequestedTiles = new Set(state.requestedTiles);
      newLoadingTiles.delete(index);
      newRequestedTiles.delete(index); // Allow retry
      return {
        loadingTiles: newLoadingTiles,
        requestedTiles: newRequestedTiles,
      };
    });
  },

  isTileLoaded: (index: number) => {
    return get().loadedTiles.has(index);
  },

  isTileLoading: (index: number) => {
    return get().loadingTiles.has(index);
  },

  getTileTexture: (index: number) => {
    return get().loadedTiles.get(index);
  },

  requestTiles: (indices: number[]) => {
    const state = get();
    const tilesToLoad: number[] = [];

    const newRequestedTiles = new Set(state.requestedTiles);

    for (const index of indices) {
      if (index < 1 || index > GRID_SIZE * GRID_SIZE) continue;
      if (newRequestedTiles.has(index)) continue;

      newRequestedTiles.add(index);
      tilesToLoad.push(index);
    }

    if (tilesToLoad.length > 0) {
      set({ requestedTiles: newRequestedTiles });
    }

    return tilesToLoad;
  },

  reset: () => {
    set(initialState);
  },
}));
