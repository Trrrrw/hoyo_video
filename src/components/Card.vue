<script setup>
const props = defineProps({
  cover: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <a-card hoverable class="card-container">
    <template #cover>
      <img class="card-cover" alt="cover" :src="cover" />
    </template>
    <a-card-meta :title="title">
    </a-card-meta>
  </a-card>
</template>

<style scoped>
.card-container {
  width: 320px;
}

.card-cover {
  height: 180px;
  object-fit: cover;
}
</style>