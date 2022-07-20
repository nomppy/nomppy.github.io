<template>
  <div>
    <sitenav></sitenav>
    <Nuxt></Nuxt>
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
  color: var(--white);
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

    p {
      color: var(--secondary-text-color);
      margin: 0.75em 0;

      strong {
        color: var(--primary-text-color);
      }

      img {
        position: relative;
        max-width: 100%;
        height: auto;
        margin: auto;
        display: block;
      }

      &.img-wrapper {
        width: 140%;
        left: -20%;
        position: relative;
      }
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
      font-size: 0.9em;
    }

    h1, h2 {
      border-bottom: 2px solid var(--tertiary-text-color);
      margin-top: 1.5em;
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

    h2 {
      border-bottom-style: dotted;
    }

    h3 {
      margin-top: 1em;
      font-size: 1.3em;
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
}

#contents {
  margin-top: 1em;
  color: var(--accent-text-color);
  text-align: center;
  font-variant: small-caps;
  font-size: 1.5em;

  + ul {
    list-style-type: none;
    padding: 0;
    width: 70%;
    max-width: 600px;
    margin: 0 auto;
    
    > li {
      font-weight: bold;
    }

    ul {
      list-style-type: none;
      padding-left: 1em;
      font-weight: normal;
    }

    a {
      color: var(--link-color);

      &:hover {
        text-decoration-color: var(--accent-text-color);
      }
    }
  }
}

@media screen and (max-width: 660px) {
  .center-container {
    font-size: 18px;
  }
}

@media screen and (min-width: 1070px) {
  .site-nav {
    position: fixed;
    flex-flow: column nowrap;
    height: 100%;
    margin: 0 20px;
  }
}
</style>
