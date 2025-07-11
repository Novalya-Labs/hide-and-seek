export interface GameState {
  error: string | null;
}

export interface GameStore extends GameState {
  clearError: () => void;
  reset: () => void;
}
