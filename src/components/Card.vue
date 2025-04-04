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
  width: calc((100% - 64px) / 5);
  min-width: 280px;
}

/* 响应式调整 */
@media (max-width: 1800px) {
  .card-container {
    width: calc((100% - 48px) / 4);
    /* 4列布局 */
  }
}

@media (max-width: 1400px) {
  .card-container {
    width: calc((100% - 32px) / 3);
    /* 3列布局 */
  }
}

@media (max-width: 1024px) {
  .card-container {
    width: calc((100% - 16px) / 2);
    /* 2列布局 */
  }
}

@media (max-width: 768px) {
  .card-container {
    width: 100%;
    /* 单列布局 */
    /* max-width: 400px; */
  }
}

.card-cover {
  height: 180px;
  object-fit: cover;
}
</style>