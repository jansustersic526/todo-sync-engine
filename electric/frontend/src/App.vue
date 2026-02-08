<script setup lang="ts">
import { ref, computed } from 'vue'
import { useShape } from './useShape'

const API_URL = 'http://localhost:3004'

type Todo = {
  id: string
  title: string
  created_at: string
}

const todos = useShape<Todo>({
  url: `${API_URL}/v1/shape`,
  params: { table: 'todos' },
})

const filteredTodos = computed(() => {
  const q = newTitle.value.trim().toLowerCase()
  if (!q) return todos.value
  return todos.value.filter((t) => t.title.toLowerCase().includes(q))
})

const newTitle = ref('')
const adding = ref(false)

async function addTodo() {
  const title = newTitle.value.trim()
  if (!title) return
  newTitle.value = ''
  adding.value = true
  try {
    await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: crypto.randomUUID(), title }),
    })
  } finally {
    adding.value = false
  }
}

function deleteTodo(id: string) {
  fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' })
}
</script>

<template>
  <div class="container">
    <h1>Electric SQL TODO Demo</h1>
    <form @submit.prevent="addTodo" class="add-form">
      <input v-model="newTitle" placeholder="Search or add a todo..." autofocus />
      <button type="submit" :disabled="adding">
        <span v-if="adding" class="spinner"></span>
        {{ adding ? 'Adding...' : 'Add' }}
      </button>
    </form>
    <ul class="todo-list">
      <li v-for="todo in filteredTodos" :key="todo.id">
        <span>{{ todo.title }}</span>
        <button @click="deleteTodo(todo.id)" class="delete-btn">Delete</button>
      </li>
      <li v-if="filteredTodos.length === 0 && newTitle.trim()" class="empty">No matching todos.</li>
      <li v-if="filteredTodos.length === 0 && !newTitle.trim()" class="empty">No todos yet. Add one above!</li>
    </ul>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
  color: #333;
}

.container {
  max-width: 500px;
  margin: 60px auto;
  padding: 0 16px;
}

h1 {
  text-align: center;
  margin-bottom: 24px;
  font-size: 1.5rem;
}

.add-form {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.add-form input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.add-form button {
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
}

.add-form button:hover:not(:disabled) {
  background: #4338ca;
}

.add-form button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.todo-list {
  list-style: none;
}

.todo-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.todo-list li.empty {
  justify-content: center;
  color: #999;
}

.delete-btn {
  padding: 4px 12px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
}

.delete-btn:hover {
  background: #dc2626;
}
</style>
