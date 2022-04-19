export type Command = 'linear' | 'vibrate' | 'linear+rotate';

export interface ConfigState {
  command: Command;
}
