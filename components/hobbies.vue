<template>
  <div>
    <div class="container">
      <div
        class="title"
      >
        hobbies
      </div>

      <div
        v-if="loaded" 
        class="hobby-container"
      >
        <!-- :style="{height: `${vertHeight}vh`}"> -->
      
        <div
          v-if="loaded" 
          class="vert-line"
        >
        <!-- :style="{height: `${vertHeight}vh`}"> -->
        </div>
        
        <div
        tabindex="0"
        v-for="(item, index) in data"
        :key="index"
        class="item hidden"
        :class="{right: index%2===1, left: index%2===0}"
        >
          <!-- :style="{'grid-row': `${index+1} / span 2`}"> -->

          <hobby-background
            :item="item"
            loading="lazy" />

          <div class="stem" />

          <div
          class="text medium"
          v-html="item.desc.join('&nbsp;')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Hobbies',
  props: [
    'scrolled',
    'data',
  ],
  data() {
    return {
      loaded: false,
      revealPause: 150,
      offset: 200,
      els: {},
    };
  },
  watch: {
    scrolled() {
      this.handleLazy();
      clearTimeout(this.revealTimeout);
      this.revealTimeout = setTimeout(() => {
        this.handleReveal();
      }, this.revealPause);
    },
  },
  mounted() {
    // this.vertHeight = this.cardHeight * this.data.length;
    this.loaded = true;
    this.els.hobby = document.getElementById('hobbies');

    setTimeout(() => {
      this.els.container = document.getElementsByClassName('hobby-container')[0];
      this.els.lazies = this.els.hobby.getElementsByClassName('item');
      this.handleReveal();
      this.handleLazy();
    });
  },
  methods: {
    handleReveal() {
      for (let i=this.els.lazies?.length;  i-- > 0; ) {
        let lazy = this.els.lazies[i];
        let bottom = this.scrolled - this.els.hobby.offsetTop - this.els.container.offsetTop;
        let lazyBottom = lazy.offsetTop + lazy.offsetHeight;
        if (bottom > lazyBottom + this.offset) {
          document.getElementsByClassName('reveal').forEach((el) => {
            el.classList.remove('reveal');
          });
          lazy.classList.add('reveal');
          return;
        }
      }
    },
    handleLazy() {
      // for (let i=0; i++ < this.els.lazies?.length - 1; ) {
      for (let i=this.els.lazies?.length;  i-- > 0; ) {
        let lazy = this.els.lazies[i];
        let bottom = this.scrolled - this.els.hobby.offsetTop - this.els.container.offsetTop;
        let lazyBottom = lazy.offsetTop + lazy.clientHeight;
        if (bottom > lazyBottom) {
          lazy.classList.remove('hidden');
          lazy.classList.add('show');
          let up = this.els.lazies[i-1]?.offsetHeight / 4 || 0;

          // not perfect, as it changes overall height of container and also does some weird stuff to the detection
          lazy.style.marginTop = `-${up}px`; 

          // lazy.style.transform = `translateY(-${up}px)`;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>

.container {
  position: relative;
  margin: 0 auto;
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  justify-content: center;
}

.hobby-container {
  margin: 50px 0;
  position: relative;
  width: 75%;
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  // align-items: flex-end;
}

:deep(.item) {
  position: relative;
  width: 40%;
  flex: 0 1 auto;
  // margin: 20px 0;

  display: flex;
  flex-flow: row nowrap;
  align-items: center;

  transition: all 1s ease;

  .bg {
    transition: transform 1.2s ease, width 1s ease;
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: hidden; // contain scaled blurry bg
    background-size: cover;
    background-position: center;

    .preview {
      transition: inherit;
      position: absolute;
      width: 0;
      height: 100%;
      background-size: inherit;
      background-position: inherit;

      filter: blur(4px) brightness(0.4);
      -webkit-filter: blur(4px) brightness(0.4);
      transform: scale(1.05);
    }
  }

  .text {
    opacity: 0;
    transition: opacity 2s ease;
    position: relative;
    transition: inherit;
    width: 90%;
    font-size: 16px !important;
    margin: 1em 0;
  }

  .bg, .text {
    transform-origin: inherit;
  }

  &.reveal, &:hover, &:focus {
    outline: none;

    .bg, .text {
      transform: scale(1.2);
    }

    .bg .preview {
      width: 100%;
    }

    .text {
      opacity: 1;
    }
  }
}

.stem {
  background-color: var(--tertiary-bg-color);
  position: absolute;
  top: calc(50% - 2px);
  height: 4px;
  border-radius: 2px;
  transition: width 0.7s ease;;

  animation: none;
  -webkit-animation: none;
}

:deep(.left) {
  align-self: flex-start;
  transform-origin: right;

  .bg .preview {
    right: 0;
  }

  .stem {
    right: -22%;
  }

  .text {
    right: 3%;
    margin-left: auto;
  }

  .bg, .text {
    transform: translateX(-200px);
  }
}

:deep(.right) {
  align-self: flex-end;
  transform-origin: left;

  .bg .preview {
    left: 0;
  }

  .stem {
    left: -22%;
  }

  .text {
    left: 3%;
  }

  .bg, .text {
    transform: translateX(200px);
  }

}

.hidden {
  opacity: 0;

  .stem {
    width: 0;
  }
}

:deep(.show) {
  opacity: 1;

  .bg, .text {
    transform: scale(0.8);
  }
  
  .stem {
    width: 20%;
  }
}

.vert-line {
  position: absolute;
  left: calc(50% - 3px);
  width: 6px;
  height: 100%;
  border-radius: 4px;
  background-color: var(--tertiary-bg-color);
}

</style>