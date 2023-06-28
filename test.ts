import test from 'node:test'
import assert from 'node:assert'
import { callSubject, resolveSubscription, subscribe } from './index'
import { Subject, filter, map, mergeMap } from 'rxjs'

test('response', async () => {
  const subj = new Subject<number>()

  subscribe(subj.pipe(mergeMap(async n => n + 1)))
  subscribe(subj.pipe(mergeMap(async n => n.toString())))

  const [num, str] = await callSubject(subj, 0)
  assert.strictEqual(num, 1)
  assert.strictEqual(str, '0')
})

test('error', async () => {
  const subj = new Subject<number>()

  subscribe(subj.pipe(mergeMap(async n => n + 1)))
  subscribe(
    subj.pipe(
      mergeMap(async () => {
        throw new Error('err-test')
      })
    )
  )

  await assert.rejects(() => callSubject(subj, 0), new Error('err-test'))
})

test('observer next', async () => {
  let next = 0
  const subj = new Subject<number>()

  subscribe(subj.pipe(mergeMap(async n => n + 1)), {
    next(value) {
      next = value
    },
  })
  await callSubject(subj, 0)
  assert.strictEqual(next, 1)
})

test('observer complete', async () => {
  let complete = false
  const subj = new Subject<number>()

  subscribe(subj.pipe(mergeMap(async n => n + 1)), {
    complete() {
      complete = true
    },
  })
  subj.complete()
  assert.strictEqual(complete, true)
})

test('observer error', async () => {
  const err = new Error('test')
  const subj = new Subject<number>()

  subscribe(
    subj.pipe(
      mergeMap(async () => {
        throw err
      })
    )
  )
  try {
    await callSubject(subj, 0)
  } catch (e) {
    assert.strictEqual(e, err)
  }
})

test('sequential', async () => {
  const subj = new Subject<number>()

  const [inc$] = subscribe(subj.pipe(mergeMap(async n => n + 1)))
  subscribe(inc$.pipe(mergeMap(async n => n.toString())))

  const [num, str] = await callSubject(subj, 0)
  assert.strictEqual(num, 1)
  assert.strictEqual(str, '1')
})

test('each subscribe returns hot observable', async () => {
  let called = 0
  const subj = new Subject<number>()

  const [inc$] = subscribe(
    subj.pipe(
      mergeMap(async n => {
        called++
        return n + 1
      })
    )
  )
  subscribe(inc$.pipe(mergeMap(async n => n.toString())))

  await callSubject(subj, 0)
  assert.strictEqual(called, 1)
})

test('filter not stuck via resolveSubscription', async () => {
  const subj = new Subject<number>()

  subscribe(
    subj.pipe(
      filter(n => {
        const resp = n > 10
        if (!resp) {
          resolveSubscription(void 0)
        }
        return resp
      })
    )
  )
  const [empty] = await callSubject(subj, 5)
  assert.strictEqual(empty, void 0)
})

test('filter not stuck via truth predicate', async () => {
  const subj = new Subject<number>()

  subscribe(
    subj.pipe(
      filter(n => {
        const resp = n > 10
        return resp
      })
    )
  )
  const [n] = await callSubject(subj, 15)
  assert.strictEqual(n, 15)
})

test('array compile time error', async () => {
  const subj = new Subject<number>()

  const arr$ = subj.pipe(map(n => [n]))
  // @ts-expect-error
  subscribe(arr$)
})
