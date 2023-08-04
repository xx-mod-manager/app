<template>
  <RouterView />
</template>

<script setup lang="ts">
if (window.electronApi !== undefined) {
  window.electronApi.onElectronLog((event) => {
    const prefix = event.caller
      ? `(ELEC)[${event.level.toUpperCase()}] [${event.caller.fileName}:${
          event.caller.functionName
        }:${event.caller.lineNumber}]`
      : `[${event.level.toUpperCase()}]`;
    switch (event.level) {
      case 'debug':
        console.debug(prefix, ...event.argumentArray);
        break;
      case 'info':
        console.info(prefix, ...event.argumentArray);
        break;
      case 'warn':
        console.warn(prefix, ...event.argumentArray);
        break;
      case 'error':
        console.error(prefix, ...event.argumentArray);
        break;
      case 'log':
        console.log(prefix, ...event.argumentArray);
        break;
    }
  });
}
</script>
