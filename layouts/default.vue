<template>
  <div>
    <sitenav></sitenav>
    <slot />
  </div>
</template>

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
  --tertiary-bg-color: #2f2f2f;

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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--primary-text-color);
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

// #__layout {
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
//   color: var(--primary-text-color);
//   position: relative;
//   width: 100%;
//   min-height: 100vh;
//   overflow-y: auto;
//   overflow-x: hidden;
// }

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

.nuxt-content-container {
    padding-bottom: 4em;
    z-index: 2;
    position: relative;
}

.nuxt-content {
    color: var(--primary-text-color);
    font-family: var(--serif-font-stack);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;

    a {
      color: var(--link-color);

      &:hover, &:visited, &:active {
        color: var(--link-hover-color);
      }
    }

    ol, ul {
      margin-bottom: 0.75em;
    }

    ol {
        list-style-type: roman;
        ol {
          list-style-type: lower-alpha;
          ol {
            list-style-type: lower-roman;

            // li::before {
            //     list-style-type: lower-roman;
            //     content: counter(level-1)') ';
            //     counter-increment: level-1;
            // }
          }
        }
    }


    // ol > li {
    //     padding-left: 1.0em;
    //     position: relative;
    // }

    // ol > ol > li {
    //     padding-left: 2.0em;
    //     position: relative;
    // }
    // ol > ol > ol > li {
    //     padding-left: 3.0em;
    //     position: relative;
    // }
    // ol li:before { 
    //     counter-increment: level-1; 
    //     content: counter(level-1) '. ';
    //     position: absolute;
    //     left: 0;
    // } 

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
      max-width: 70%;
      margin: 0 auto;
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

.footnote-ref{
  text-decoration: none;

  &::before {
    content: '[';
    padding: 0 1px;
  }

  &::after {
    content: ']';
    padding: 0 1px;
  }
}
  
.hover-footnote {
  position: fixed;
  bottom: 1em;
  max-width: 20em;
  color: var(--primary-text-color);
  background-color: var(--tertiary-bg-color);
  border: 1px solid var(--tertiary-text-color);
  padding: 0.5rem;
  left: calc(50% - 10em);
  font-size: 0.8em;
  z-index: 999;
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

  .hover-footnote {
    left: unset;
    right: 1em;
  }
}

// === POSTS AND DRAFTS===

.post-category {
  margin-top: 2em;
  margin-bottom: 3em;

  .category-items {
    margin: 1em 0em 0 0;
    padding: 0 0 0 0;
    list-style: none;
  }

  .category-name {
    margin: 0;
    font-size: 1.1em;
    font-variant: small-caps;
    text-transform: capitalize;
  }
  
  .preview-description {
    font-size: 0.75em;
    line-height: 1em;
    color: var(--tertiary-text-color);
  }
}

a {
  color: var(--link-color);

  &:hover, &:visited, &:active {
    color: var(--link-hover-color);
  }
}

@media only screen and (min-width: 1000px) {
  .post-categories {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 2em;
    grid-row-gap: 2em;
    padding-top: 2em;

    .post-category {
      margin: 0;
    }
  }
}
</style>