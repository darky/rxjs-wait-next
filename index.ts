import { Observable, Observer, Subject, Subscription, catchError, throwError } from 'rxjs'
import { diDep, diInit, diSet } from 'ts-fp-di'

const RXJS_WAIT_NEXT_RESOLVE = 'rxjs-wait-next-resolve'
const RXJS_WAIT_NEXT_REJECT = 'rxjs-wait-next-reject'

export const rxjsWaitNextWrap = async <T, V>(subject: Subject<V>, value: V): Promise<T[]> => {
  return await diInit(async () => {
    return await new Promise<T[]>(async (resolve, reject) => {
      let resp: T[] = []
      let calls = 0
      diSet(RXJS_WAIT_NEXT_RESOLVE, (respItem: T) => {
        calls++
        resp.push(respItem)
        if (calls === subject.observers.length) {
          resolve(resp)
        }
      })
      diSet(RXJS_WAIT_NEXT_REJECT, reject)
      subject.next(value)
    })
  })
}

export const rxjsWaitNextSubscribe = <T>(
  observable: Observable<T>,
  observer?: Observer<T>,
  needThrow = false
): Subscription => {
  return observable
    .pipe(
      catchError((err, caught) => {
        if (needThrow) {
          throwError(() => err)
        }
        diDep<(value: unknown) => void>(RXJS_WAIT_NEXT_REJECT)(err)
        return caught
      })
    )
    .subscribe({
      next(value) {
        observer?.next.call(this, value)
        diDep<(value: T) => void>(RXJS_WAIT_NEXT_RESOLVE)(value)
      },
      error(err) {
        observer?.error.call(this, err)
        diDep<(value: unknown) => void>(RXJS_WAIT_NEXT_REJECT)(err)
      },
      complete() {
        observer?.complete.call(this)
      },
    })
}

export const wnw = rxjsWaitNextWrap
export const wns = rxjsWaitNextSubscribe
