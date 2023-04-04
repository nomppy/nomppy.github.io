<template>
  <div>
    <div class="rain"></div>
    <sitenav></sitenav>
    <Nuxt></Nuxt>
  </div>
</template>

<script>
export default {
  mounted() {
    this.rain();
  },
  methods: {
    rain() {
      var increment = 0;
      var drops = '';

      while (increment < 51) {
        //couple random numbers to use for various randomizations
        //random number between 98 and 1
        var randoHundo = (Math.floor(Math.random() * (130 - 1 + 1) + 1));
        //random number between 5 and 2
        var randoFiver = (Math.floor(Math.random() * (5 - 2 + 1) + 2));
        //increment
        increment += randoFiver;
        //add in a new raindrop with various randomizations to certain CSS properties
        drops += '<div class="drop" style="left: ' + 
          increment*2 + '%; bottom: ' + 
          (-randoFiver - randoFiver) + 
          'vh; animation-delay: 0.' + randoHundo + 
          's; animation-duration: 2.' + randoHundo + 
          's;"><div class="stem" style="animation-delay: 0.' + 
          randoHundo + 's; animation-duration: 2.' + randoHundo + 
          's;"></div><div class="splat" style="animation-delay: 0.' + 
          randoHundo + 's; animation-duration: 2.' + randoHundo + 's;"></div></div>';
      }

      document.getElementsByClassName('rain')[0].innerHTML += drops.trim();
    },
  }, 
};
</script>

<style src="~/assets/styles/avenir-white.css" />
<style lang="scss">

.rain {
  position: relative;
}

.drop {
	position: absolute;
	bottom: 100%;
	width: 15px;
	height: 120px;
	pointer-events: none;
	animation: drop 0.5s linear infinite;
}

@keyframes drop {
	0% {
		transform: translateY(0vh);
	}
	75% {
		transform: translateY(90vh);
	}
	100% {
		transform: translateY(90vh);
	}
}

.stem {
  width: 2px;
  height: 60%;
  margin-left: 7px;
  opacity: 20%;
  background: linear-gradient(to bottom, var(--rain-stem-base), var(--rain-stem-fade));
  animation: stem 0.5s linear infinite;
}

@keyframes stem {
  0% {
    opacity: 1;
  }
  65% {
    opacity: 1;
  }
  75% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
}

.splat {
	width: 15px;
	height: 10px;
	border-top: 2px dotted rgba(255, 255, 255, 0.5);
	border-radius: 50%;
	opacity: 1;
	transform: scale(0);
	animation: splat 0.5s linear infinite;
}

@keyframes splat {
	0% {
		opacity: 1;
		transform: scale(0);
	}
	80% {
		opacity: 1;
		transform: scale(0);
	}
	90% {
		opacity: 0.5;
		transform: scale(1);
	}
	100% {
		opacity: 0;
		transform: scale(1.5);
	}
}
</style>