import { onMounted, onUnmounted } from 'vue';

export function useShortcut(key, callback) {
  const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  const handleKeyDown = (event) => {
    const modifierKeyPressed = isMac ? event.metaKey : event.ctrlKey;

    if (modifierKeyPressed && event.key === key) {
      event.preventDefault();
      callback();
    }
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });
}
