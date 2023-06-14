# rxjs-wait-next

Wait RxJS Subject.next emition for all subscribers<br/>

## How it works

**rxjs-wait-next** listens all subscriptions emissions <br/>
When all emissions happens, it's resolved <br/>
Some operators, like `filter`, may interfere to emissions happens and need to use manual emission in this case via `resolveSubscription`

## Examples

See https://github.com/darky/rxjs-wait-next/blob/master/test.ts

## Limitation

* Works on Node.js only, it's uses `AsyncLocalStorage`
