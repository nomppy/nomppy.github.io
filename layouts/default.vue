<template>
  <div>
    <sitenav></sitenav>
    <Nuxt></Nuxt>
  </div>
</template>

<script>

</script>

<!-- <style src="~/assets/styles/avenir-white.css" /> -->
<style lang="scss">
:root {
  --serif-font-stack: "Zilla Slab", "Average", "Libre Baskerville", "Times New Roman", serif;
  --sans-serif-font-stack: "Montserrat", "Source Sans Pro", "Roboto", "Helvetica", sans-serif;
  
  --white: white;
  --black: black;
  --faded-gray: rgba(255, 255, 255, 0.25);
}

.dark-mode{
  --primary-text-color: var(--white);
  --secondary-text-color: #eee;
  --tertiary-text-color: #cdc5ade0;
  // --tertiary-text-color: #846860;
  --accent-text-color: #1998DB;
  --highlight-text-color: #647ee8;

  --link-color: #3ebee9;
  --link-hover-color: #8F9AFF;

  --primary-bg-color: #171717;
  --secondary-bg-color: #1d1f20;
  --tertiary-bg-color: #fffaf0;

  --rain-stem-base: var(--black);
  --rain-stem-fade: var(--faded-gray);
}

.light-mode{
  --primary-text-color: var(--black);
  --secondary-text-color: #111;
  --tertiary-text-color: #684135;
  --accent-text-color: #1998DB;
  --highlight-text-color: #415296;

  --link-color: #0785ac;
  --link-hover-color: #454fbb;

  --primary-bg-color: #ececec;
  --secondary-bg-color: #e3e3e3;
  --tertiary-bg-color: #fffaf0;

  --rain-stem-base: var(--white);
  --rain-stem-fade: var(--faded-gray);
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

button {
  outline: none;
  background: transparent;
  border: 1px solid transparent;
}

button:focus {
  outline: none;
  background: transparent;
  border: 1px solid grey;
}

button:active {
  transform: scale(0.9);
}

#__nuxt {
  overflow-y: auto;
  overflow-x: hidden;
  background-color: var(--primary-bg-color);
  transition: background-color 0.5s;
}

#__layout {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--primary-text-color);
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
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

.center-container {
  margin: 0 auto;
  max-width: 700px;
  padding: 0 1.5em;
}

.title {
  color: var(--primary-text-color);
  text-align: center;
  font-family: var(--serif-font-stack);
  font-weight: 600;
  font-size: 3em;
  font-variant: petite-caps;
  line-height: 1.15;
  margin-bottom: 20px;
}

.nuxt-content {
    z-index: 2;
    color: var(--primary-text-color);
    font-family: var(--serif-font-stack);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    position: relative;
    padding-bottom: 4em;

    a {
      color: var(--link-color);

      &:hover, &:visited, &:active {
        color: var(--link-hover-color);
      }
    }

    ol, ul {
      margin-bottom: 0.75em;
    }
    p {
      color: var(--secondary-text-color);
      margin: 0 0 0.75em 0;

      .hl {
        color: var(--highlight-text-color);
      }

      strong {
        color: var(--primary-text-color);
      }
    }

    small.whisper {
      color: var(--secondary-text-color);
      font-size: 0.6em;
    }

    img {
      position: relative;
      max-width: 80%;
      height: auto;
      margin: auto;
      display: block;
    }

    .img-caption {
      text-align: center;
      margin-bottom: 1em;
      font-size: 0.8em;
      color: var(--tertiary-text-color);
    }

    iframe {
      position: relative;
      height: 30vh;
      width: 100%;
      display: block;
    }

    pre {
      overflow-x: scroll;
    }

    code {
      font-size: 0.75em;
    }

    hr {
      width: 50%;
      margin: 1.5em auto;
      height: 0.1em;
    }

    h1, h2 {
      border-bottom: 2px solid var(--tertiary-text-color);
      margin-top: 1.25em;
      margin-bottom: 0.8em;

      a::before {
        content: '#';
        cursor: pointer;
        position: absolute;
        left: -25px;
        font-weight: normal;
        color: var(--accent-text-color);
      }
    }

    h1 {
      font-size: 1.5em;
    }

    h2 {
      font-size: 1.3em;
    }

    h3 {
      margin-top: 1em;
      font-size: 1.2em;
    }

    table {
      display: block;
      overflow-x: scroll;
      border-collapse: collapse;
      padding: 0.75em 0;
    }

    td, th {
      border: 1px solid var(--secondary-text-color);
      padding: 0.3em 0.5em;
    }

    th {
      background-color: var(--secondary-bg-color);
      font-weight: 800;
      color: var(--primary-text-color);
    }

    td {
      color: var(--secondary-text-color);
    }

    .footnotes {
      font-size: 0.8em;
      color: var(--secondary-text-color);
    }
}

#contents {
  margin-top: 1em;
  text-align: center;
  font-variant: small-caps;
  font-size: 1.5em;

  + ul {
    list-style-type: none;
    padding: 0;
    width: 70%;
    max-width: 600px;
    margin: 0.5em auto 2.5em auto;
    
    > li {
      font-weight: bold;
    }

    ul {
      // list-style-type: none;
      padding-left: 1em;
      font-weight: normal;
    }
  }
}

@media screen and (max-width: 380px) {
  .center-container {
    padding: 0 0.5em;
  }
}

@media screen and (max-width: 480px) {
  .headline-clip, .letters.dummy {
    display: none !important;
  }
}

@media screen and (max-width: 660px) {
  .center-container {
    font-size: 16;
  }
}

@media screen and (min-width: 1070px) {
  .site-nav {
    position: fixed;
    flex-flow: column nowrap;
    height: 100%;
    margin: 0 18;
  }
}
</style>
