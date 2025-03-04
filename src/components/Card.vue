<script setup>
const props = defineProps({
  cover: {
    type: String,
    required: true,
  },
  typeName: {
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
    <a-card-meta :title="typeName">
    </a-card-meta>
  </a-card>
</template>

<style scoped>
.card-container {
  width: 320px;
}

.card-cover {
  width: 320px;
  height: 180px;
  object-fit: cover;
  /* 保持图片比例并填充容器 */
}
</style>