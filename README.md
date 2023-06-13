# rxjs-wait-next

Wait RxJS Subject.next emition for all subscribers<br/>

## Example

```ts
import { callSubject, subscribe } from 'rxjs-wait-next'
import { Subject, mergeMap } from 'rxjs'

const subj = new Subject<number>()
subscribe(subj.pipe(mergeMap(async n => n + 1)))

const [num] = await callSubject(subj, 0)
num // 1
```

## Limitation

* Works on Node.js only, it's uses `AsyncLocalStorage`
* You should avoid operators, which can omit `subscribe` call, like `filter`, `partition` and so on
