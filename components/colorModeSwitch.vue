<template>
  <div class="color-mode-switch">
    <button 
    v-show="$colorMode.preference === 'light' || $colorMode.value === 'light'"
    @click="$colorMode.preference = 'dark'">
      <svg-icon 
      class='icon' name="light" />
    </button>
    <button 
    v-show="$colorMode.preference === 'dark' || $colorMode.value === 'dark'"
    @click="$colorMode.preference = 'light'">
      <svg-icon 
      class='icon' name="dark" />
    </button>
    <!-- <button 
    v-show="$colorMode.preference === 'system'"
    @click="onSwitch">
      <svg-icon 
      class='icon' name="system" />
    </button> -->

  </div>
</template>

<style lang="scss" scoped>
.icon {
  display: inline-block;
  position: relative;
  width: 1.5em;
  height: 1.5em;
  font-size: 1em;
  fill: var(--primary-text-color);
  color: var(--primary-text-color);

  :hover {
    cursor: pointer;
  }
}
</style>