import { ref, onUnmounted, type Ref } from 'vue'

interface InitMessage<T> { type: 'init'; todos: T[] }
interface AddedMessage<T> { type: 'added'; todo: T }
interface DeletedMessage { type: 'deleted'; id: string }

type WsMessage<T> = InitMessage<T> | AddedMessage<T> | DeletedMessage

export function useWebSocket<T extends { id: string }>(url: string): { rows: Ref<T[]> } {
  const rows = ref<T[]>([]) as Ref<T[]>
  let ws: WebSocket | null = null
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let stopped = false

  function connect() {
    if (stopped) return
    ws = new WebSocket(url)

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data) as WsMessage<T>
      switch (msg.type) {
        case 'init':
          rows.value = msg.todos
          break
        case 'added':
          rows.value = [...rows.value, msg.todo]
          break
        case 'deleted':
          rows.value = rows.value.filter((r) => r.id !== msg.id)
          break
      }
    }

    ws.onclose = () => {
      if (!stopped) {
        reconnectTimer = setTimeout(connect, 1000)
      }
    }

    ws.onerror = () => {
      ws?.close()
    }
  }

  connect()

  onUnmounted(() => {
    stopped = true
    if (reconnectTimer) clearTimeout(reconnectTimer)
    ws?.close()
  })

  return { rows }
}
