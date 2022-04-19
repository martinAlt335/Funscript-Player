import {
  BehaviorSubject,
  concat,
  defer,
  EMPTY,
  Observable,
  of,
  Subject,
  timer,
} from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';

export function getStopWatch(interval: number = 1000): {
  control$: BehaviorSubject<string>;
  display$: Observable<number>;
} {
  const control$ = new BehaviorSubject<string>('STOP');
  return {
    control$,
    display$: createStopwatch(control$, interval),
  };
}

function createStopwatch(
  control$: Observable<string>,
  interval = 1000
): Observable<number> {
  return defer(() => {
    let toggle = false;
    let count = 0;

    const ticker = timer(0, interval).pipe(map((x) => count++));
    const end$ = of('END');

    return concat(control$, end$).pipe(
      catchError((_) => end$),
      filter(
        (control) =>
          control === 'START' ||
          control === 'STOP' ||
          control === 'RESET' ||
          control === 'END'
      ),
      switchMap((control) => {
        if (control === 'START' && !toggle) {
          toggle = true;
          return ticker;
        } else if (control === 'STOP' && toggle) {
          toggle = false;
          return EMPTY;
        } else if (control === 'RESET') {
          count = 0;
          if (toggle) {
            return ticker;
          }
        }
        return EMPTY;
      })
    );
  });
}
