const TEST_CYCLES = 100_000
class MyCustomElement extends HTMLElement {
  #innerTestAttribute

  connectedCallback() {
    const buttons = Array.from(document.querySelectorAll('button'))
    this.innerElement = this.querySelector('my-inner-element')


    buttons.forEach(b => b.addEventListener('click', (e) => {
      console.log('marks cleared?:', performance.getEntriesByType("mark").length);
      const memoized = e.target.classList.contains('memoized')
      console.log(`start test run (access ${memoized ? "IS NOT": "IS"} memoized)`);

      const hasAttr  = (memoized ? this.memoizedAttrAccess : this.unmemoizedAttrAccess).bind(this)

      for (let i = 0; i < TEST_CYCLES; i++) {
        performance.mark('start')

        const attr = hasAttr()

        performance.mark('end')
        performance.measure('Measurement', { start: 'start', end: 'end', detail: { testVal: attr } })
      }
      console.log('end test cycle');
      console.log('compute results:');

      const measurements = performance.getEntriesByName('Measurement')
      const meantime = measurements.reduce((res, curr) => {
        res += curr.duration
        return res
      }, 0) / TEST_CYCLES
      console.log('results:', 'meantime -> ', meantime, ' (for ', performance.getEntriesByName("Measurement").length,' measurements)');

      this.insertAdjacentHTML('beforeend', `<p>Meantime for "${memoized ? "memoized" : "not memoized"}" is: ${meantime}</p>`)

      performance.clearMarks()
      performance.clearMeasures()
    }))
  }

  unmemoizedAttrAccess() {
    return this.innerElement.hasAttribute('test-attr')
  }

  memoizedAttrAccess() {
    if (this.#innerTestAttribute) return this.#innerTestAttribute

    this.#innerTestAttribute = this.innerElement.hasAttribute('test-attr')
    return this.#innerTestAttribute
  }
}

customElements.define('my-custom-element', MyCustomElement)
