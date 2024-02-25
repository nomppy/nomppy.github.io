<template>
  <div class="color-mode-switch">
    <ColorScheme placeholder="..." tag="span">
      <button 
      v-show="$colorMode.preference === 'dark'"
      @click="$colorMode.preference = 'system'">
        <Icon class='icon' name="ph:moon-fill" />
        <!-- <nuxt-icon class='icon' name="light" /> -->
      </button>
      <button 
      v-show="$colorMode.preference === 'light'"
      @click="$colorMode.preference = 'dark'">
        <Icon class="icon" name="ph:sun-fill" />
      </button>
      <button 
      v-show="$colorMode.preference === 'system'"
      @click="$colorMode.preference = 'light'">
        <Icon class="icon" name="ri:computer-line" />
      </button>

    </ColorScheme>
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

  :active {
    transform: none !important;
    outline: none;
  }

  svg path {
    outline: none !important;

    :focus {
      outline: none !important;
    }
  }
}
</style>