<template>
<div>
  <Nuxt id="main-view">
  </Nuxt>
</div>
</template>

<style lang="scss">

:root {
  --primary-text-color: var(--white);
  --secondary-text-color: #ddd;
  --tertiary-text-color: #DBA507;
  --accent-text-color: #1998DB;

  --link-color: #136fa0;
  --link-hover-color: #5c6cff;

  --primary-bg-color: #171717;
  --secondary-bg-color: rgba(89, 89, 89, 0.6);
  --tertiary-bg-color: #fffaf0;

  --serif-font-stack: "Zilla Slab", "Average", "Libre Baskerville", "Times New Roman", serif;
  --sans-serif-font-stack: "Montserrat", "Source Sans Pro", "Roboto", "Helvetica", sans-serif;
  
  --white: white;
  --black: black;
}

* {
  margin: 0;	
}

html {
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-scrollbar: none;
  font-size: 20px;
  font-weight: 400;
  line-height: 1.5;
  font-family: var(--serif-font-stack);
}

button, button:focus {
  outline: none;
  background: transparent;
  border: 1px solid transparent;
}

button:active {
  outline: none;
  background: transparent;
  border: 1px solid grey;
}

#__nuxt {
  overflow-y: auto;
  overflow-x: hidden;
}

#__layout {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: var(--primary-bg-color);
  color: var(--primary-text-color);
  position: relative;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

#main-view {
  position: relative;
  overflow: hidden;
  // scrollbar-width: none;
  // -ms-overflow-style: none;
  // -webkit-scrollbar: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.noselect {
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Old versions of Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome, Edge, Opera and Firefox */
}

</style>
