import { shallowRef, onScopeDispose, type ShallowRef } from 'vue'
import { ShapeStream, Shape, type ShapeStreamOptions, type Row, type GetExtensions } from '@electric-sql/client'

export function useShape<T extends Row<unknown> = Row>(
  options: ShapeStreamOptions<GetExtensions<T>>
): ShallowRef<T[]> {
  const rows = shallowRef<T[]>([]) as ShallowRef<T[]>

  const stream = new ShapeStream<T>(options)
  const shape = new Shape(stream)

  shape.subscribe(({ rows: newRows }) => {
    rows.value = [...newRows]
  })

  onScopeDispose(() => {
    stream.unsubscribeAll()
  })

  return rows
}
