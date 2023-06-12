import test from 'node:test'
import assert from 'node:assert'
import { callSubject, subscribe } from './index'
import { Subject, mergeMap } from 'rxjs'

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
