import { shallowRef, onUnmounted } from 'vue'
import { ShapeStream, Shape } from '@electric-sql/client'

export function useShape({ url, params }) {
  const rows = shallowRef([])

  const stream = new ShapeStream({ url, params })
  const shape = new Shape(stream)

  shape.subscribe(({ rows: latestRows }) => {
    rows.value = latestRows
  })

  onUnmounted(() => {
    stream.unsubscribeAll()
  })

  return { rows }
}
