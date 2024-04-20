<template>
  <div class="sub-action">
    <slot>
    Thank you for reading - if you enjoyed this post,
    get new ones (and more) emailed to you:
    </slot>

    <form
        class="light form email-sub"
        name="gform"
        id="gform"
        enctype="text/plain"
        action="https://docs.google.com/forms/d/e/1FAIpQLSdqIg6GPEJXH4vRY_Gnl8f13AitXlekgKSpYiazVgk1ELeCFA/formResponse?"
        target="hidden_iframe" onsubmit=submitted()>
      <div class="fade-out" id="email-entry">
        <input
            class="email-box"
            type="text"
            placeholder="you@example.com"
            name="entry.1045781291"
            id="entry.1045781291">
        <input
            class="email-submit"
            id="submit" type="submit" value="Subscribe">
      </div>
    </form>

  </div>
</template>

<style scoped lang='scss'>
.email-sub {
  display: inline-block;
  padding-left: 0.3em;
}

.email-box {
  border: none;
  outline: none;
  background: none;
  border-bottom: 2px solid var(--primary-text-color);
  padding: 0;
  font-family: auto;
  text-align: left;
  color: var(--primary-text-color);
  height: 100%;
}

.email-submit {
  font-family: auto;
  margin: 0.3em;
  padding: 0.2em 0.5em;
  color: var(--primary-text-color);
  border-radius: 4px;
  border: 1px solid var(--primary-text-color);
  background-color: var(--primary-bg-color);

  &:hover {
    cursor: pointer;
    background-color: var(--secondary-bg-color);
  }
}
</style>
