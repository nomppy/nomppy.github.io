<template>
<div>
  <Nuxt id="main-view">
  </Nuxt>
</div>
</template>

<style lang="scss">

:root {
  --primary-text-color: #fff;
  --accent-text-color: #1998DB;
  --link-color: #1998DB;
  --link-hover-color: #136fa0;
  --secondary-text-color: rgb(92, 108, 255);
  --primary-bg-color: #171717;
  --secondary-bg-color: rgba(88,88,88,0.601);
  --tertiary-bg-color: rgb(255, 250, 240);

  --serif-font-stack: "Average", "EB Garamond", "Libre Baskerville", "Times New Roman", "Times", serif;
  --sans-serif-font-stack: "Source Sans Pro", "Montserrat", "Roboto", "Open Sans", "Helvetica", sans-serif;
  
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
  font-family: var(--serif-font-stack);
}

@media only screen and (max-width: 649px) {
  html {
      font-size: 18px;
  }
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
  font-family: 'Open Sans', sans-serif;
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
