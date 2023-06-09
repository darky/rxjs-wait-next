import test from 'node:test'
import assert from 'node:assert'
import { callSubject, subscribe } from './index'
import { Subject, mergeMap } from 'rxjs'

test('basic', async () => {
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
