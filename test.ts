import test from 'node:test'
import assert from 'node:assert'
import { wnw, wns } from './index'
import { Subject, mergeMap } from 'rxjs'

test('basic', async () => {
  const sub = new Subject<number>()

  wns(sub.pipe(mergeMap(async n => n + 1)))
  wns(sub.pipe(mergeMap(async n => n.toString())))

  const [n1, ns] = await wnw<number | string, number>(sub, 0)
  assert.strictEqual(n1, 1)
  assert.strictEqual(ns, '0')
})
