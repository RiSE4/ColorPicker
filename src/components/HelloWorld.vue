<script setup>
import { ref } from 'vue'

defineProps({
  msg: String,
})

const count = ref(0)
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <div class="text-3xl font-bold text-blue-500">
      <p>
        Vue による実装に対応中のため、現在利用できません。
      </p>
    </div>
  </div>

</template>
