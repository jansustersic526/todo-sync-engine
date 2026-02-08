import { createCollection } from '@tanstack/vue-db'
import { electricCollectionOptions, isChangeMessage } from '@tanstack/electric-db-collection'

const API_URL = 'http://localhost:3001'

export const todoCollection = createCollection(
  electricCollectionOptions({
    id: 'todos',
    shapeOptions: {
      url: `${API_URL}/v1/shape`,
      params: { table: 'todos' },
    },
    getKey: (item) => item.id,
    onInsert: async ({ transaction, collection }) => {
      const todo = transaction.mutations[0].modified
      await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: todo.id, title: todo.title }),
      })
      await collection.utils.awaitMatch(
        (message) =>
          isChangeMessage(message) &&
          message.headers.operation === 'insert' &&
          message.value.id === todo.id
      )
    },
    onDelete: async ({ transaction, collection }) => {
      const todo = transaction.mutations[0].original
      await fetch(`${API_URL}/todos/${todo.id}`, { method: 'DELETE' })
      await collection.utils.awaitMatch(
        (message) =>
          isChangeMessage(message) &&
          message.headers.operation === 'delete' &&
          message.value.id === todo.id
      )
    },
  })
)
