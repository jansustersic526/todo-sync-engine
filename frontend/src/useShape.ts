import { shallowRef, onUnmounted, type ShallowRef } from 'vue'
import { ShapeStream, Shape, ExternalParamsRecord, Row } from '@electric-sql/client'

export function useShape<T>(options: { url: string; params: ExternalParamsRecord<Row<never>> }): { rows: ShallowRef<T[]> } {
  const rows = shallowRef<T[]>([])

  const stream = new ShapeStream({ url: options.url, params: options.params })
  const shape = new Shape(stream)

  shape.subscribe(({ rows: latestRows }) => {
    rows.value = latestRows as T[]
  })

  onUnmounted(() => {
    stream.unsubscribeAll()
  })

  return { rows }
}
