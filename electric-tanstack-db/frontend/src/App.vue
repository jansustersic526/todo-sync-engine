<script setup lang="ts">
import { ref } from 'vue'
import { useLiveQuery } from '@tanstack/vue-db'
import { ilike } from '@tanstack/db'
import { todoCollection } from './todoCollection'

const newTitle = ref('')

const { data: todos } = useLiveQuery((q) => {
  let query = q.from({ todo: todoCollection })
  const s = newTitle.value.trim()
  if (s) {
    query = query.where(({ todo }) => ilike(todo.title, `%${s}%`))
  }
  return query.select(({ todo }) => ({
    id: todo.id,
    title: todo.title,
    created_at: todo.created_at,
  }))
})

function addTodo() {
  const title = newTitle.value.trim()
  if (!title) return
  newTitle.value = ''
  todoCollection.insert({
    id: crypto.randomUUID(),
    title,
    created_at: new Date().toISOString(),
  })
}

function deleteTodo(id: string) {
  todoCollection.delete(id)
}
</script>

<template>
  <div class="container">
    <h1>Electric SQL TODO Demo</h1>
    <form @submit.prevent="addTodo" class="add-form">
      <input v-model="newTitle" placeholder="Search or add a todo..." autofocus />
      <button type="submit">Add</button>
    </form>
    <ul class="todo-list">
      <li v-for="todo in todos" :key="todo.id">
        <span>{{ todo.title }}</span>
        <button @click="deleteTodo(todo.id)" class="delete-btn">Delete</button>
      </li>
      <li v-if="todos.length === 0 && !newTitle.trim()" class="empty">No todos yet. Add one above!</li>
      <li v-if="todos.length === 0 && newTitle.trim()" class="empty">No matching todos.</li>
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

.add-form button:hover {
  background: #4338ca;
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
