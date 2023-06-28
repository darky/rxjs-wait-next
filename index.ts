import { Observable, Observer, Subject, catchError, share, tap } from 'rxjs'
import { AnonymousSubject } from 'rxjs/internal/Subject'
import { diDep, diInit, diSet } from 'ts-fp-di'

const RXJS_WAIT_NEXT_RESOLVE = 'rxjs-wait-next-resolve'
const RXJS_WAIT_NEXT_REJECT = 'rxjs-wait-next-reject'

const subjectCalls = new Map<Subject<any>, number>()

export const callSubject = async <V>(subject: Subject<V>, value: V): Promise<unknown[]> => {
  return await diInit(async () => {
    return await new Promise(async (resolve, reject) => {
      let resp: unknown[] = []
      let calls = 0
      const allCalls = subjectCalls.get(subject)
      diSet(RXJS_WAIT_NEXT_RESOLVE, (respItem: unknown) => {
        calls++
        resp = resp.concat(respItem)
        if (calls === allCalls) {
          resolve(resp)
        }
      })
      diSet(RXJS_WAIT_NEXT_REJECT, reject)
      subject.next(value)
    })
  })
}

export function subscribe<T>(
  observable: Observable<T extends Array<any> ? never : T>,
  observer?: Partial<Observer<T>>
) {
  calcSubjectCalls(observable)
  const obs = observable.pipe(
    catchError((err, caught) => {
      diDep<(value: unknown) => void>(RXJS_WAIT_NEXT_REJECT)(err)
      return caught
    }),
    tap(value => resolveSubscription(value)),
    share()
  )
  const subscription = obs.subscribe(observer)
  return [obs, subscription] as const
}

export const resolveSubscription = (value: unknown) => diDep<(value: unknown) => void>(RXJS_WAIT_NEXT_RESOLVE)(value)

const calcSubjectCalls = (observable: Observable<unknown>) => {
  if (observable.source instanceof Subject && !(observable.source instanceof AnonymousSubject)) {
    subjectCalls.set(observable.source, (subjectCalls.get(observable.source) ?? 0) + 1)
  }
  if (!observable.source) {
    return
  }
  calcSubjectCalls(observable.source)
}
