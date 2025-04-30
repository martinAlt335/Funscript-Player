import { Funscript } from "funscript-utils/lib/types";

export interface FunscriptChangedEvent {
    funscript: Funscript | undefined;
    source: 'upload' | 'edit';
}
