<template lang="pug">
#preview-area(v-if="currentQuestionId && isPlaying")
  .preview-image-container(v-for="(image, index) in previewImages", :key="index")
    img(:src="image", alt="プレビュー画像")
    span.arrow(v-if="index < previewImages.length - 1") →
</template>

<script setup>
defineProps({
  currentQuestionId: Number,
  isPlaying: Boolean,
  previewImages: Array,
})
</script>

<style lang="scss" scoped>
@import '@/assets/_variables.scss';

#preview-area {
  display: flex;
  align-items: center;
  justify-content: center; // Center the images
  margin: 20px;

  .preview-image-container {
    display: flex;
    align-items: center;

    img {
      width: 400px;
      height: auto;
      border: 2px solid $white;
      border-radius: 15px;
      box-shadow: 0 4px 8px $shadow-color;
    }

    .arrow {
      margin: 0 10px;
      font-size: 24px;
      font-weight: bold;
    }
  }
}
</style>
