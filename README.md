# rxjs-wait-next

Wait RxJS Subject.next emition for all subscribers<br/>

## How it works

**rxjs-wait-next** listens all subscriptions emissions:

https://github.com/darky/rxjs-wait-next/blob/a06f0dde942be5ff081f0dadb66484edddcb59bb/index.ts#L27-L31

When all emissions happens, it's resolved:

https://github.com/darky/rxjs-wait-next/blob/a06f0dde942be5ff081f0dadb66484edddcb59bb/index.ts#L12-L17

Some operators, like `filter`, may interfere to emissions happens. <br/>
Need to use manual emission in this case: 

https://github.com/darky/rxjs-wait-next/blob/a06f0dde942be5ff081f0dadb66484edddcb59bb/test.ts#L105-L121

## Examples

See https://github.com/darky/rxjs-wait-next/blob/master/test.ts

## Limitation

* Works on Node.js only, it's uses `AsyncLocalStorage`
