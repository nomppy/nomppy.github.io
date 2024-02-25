<template>
  <div class="color-mode-switch">
    <ColorScheme placeholder="..." tag="span">

      <button 
      v-show="$colorMode.preference === 'light' || $colorMode.value === 'light'"
      @click="$colorMode.preference = 'dark'">
        <nuxt-icon class='icon' name="light" />
        <!-- <svg-icon class='icon' name="light" /> -->
      </button>
      <button 
      v-show="$colorMode.preference === 'dark' || $colorMode.value === 'dark'"
      @click="$colorMode.preference = 'light'">
        <nuxt-icon class='icon' name="dark" />
        <!-- <svg-icon class='icon' name="dark" /> -->
      </button>

    </ColorScheme>
  </div>
</template>

<style lang="scss" scoped>
.icon {
  display: inline-block;
  position: relative;
  width: 2em;
  height: 2em;
  font-size: 1.5em;
  fill: var(--primary-text-color);
  color: var(--primary-text-color);

  :hover {
    cursor: pointer;
  }
}
</style>