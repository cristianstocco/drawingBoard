const event = {}

event.outsideClick = (trigger, container) => {
  const onClick = (ev) => {
    const safetyLimit = 1000
    let parentContainer = ev.target
    let i = 0

    while (parentContainer !== document.body &&
      parentContainer !== null) {
      if (parentContainer === container) {
        return
      }

      parentContainer = parentContainer.parentNode

      i++
      if (i > safetyLimit) {
        console.log('Infinite loop @ event.outsideClick')
        return
      }
    }

    trigger(ev)
    window.removeEventListener('click', onClick)
  }

  window.addEventListener('click', onClick)
}

export default event