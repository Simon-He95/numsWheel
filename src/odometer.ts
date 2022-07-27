import { addStyle } from 'simon-js-tool'
import type { TransitionCheckStyles } from './types'

export function odometer(this: any) {
  addStyle(`.odometer.odometer-auto-theme, .odometer.odometer-theme-minimal {
    display: inline-block;
    vertical-align: middle;
    *vertical-align: auto;
    *zoom: 1;
    *display: inline;
    position: relative;
  }
  .odometer.odometer-auto-theme .odometer-digit, .odometer.odometer-theme-minimal .odometer-digit {
    display: inline-block;
    vertical-align: middle;
    *vertical-align: auto;
    *zoom: 1;
    *display: inline;
    position: relative;
  }
  .odometer.odometer-auto-theme .odometer-digit .odometer-digit-spacer, .odometer.odometer-theme-minimal .odometer-digit .odometer-digit-spacer {
    display: inline-block;
    vertical-align: middle;
    *vertical-align: auto;
    *zoom: 1;
    *display: inline;
    visibility: hidden;
  }
  .odometer.odometer-auto-theme .odometer-digit .odometer-digit-inner, .odometer.odometer-theme-minimal .odometer-digit .odometer-digit-inner {
    text-align: left;
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow: hidden;
  }
  .odometer.odometer-auto-theme .odometer-digit .odometer-ribbon, .odometer.odometer-theme-minimal .odometer-digit .odometer-ribbon {
    display: block;
  }
  .odometer.odometer-auto-theme .odometer-digit .odometer-ribbon-inner, .odometer.odometer-theme-minimal .odometer-digit .odometer-ribbon-inner {
    display: block;
    -webkit-backface-visibility: hidden;
  }
  .odometer.odometer-auto-theme .odometer-digit .odometer-value, .odometer.odometer-theme-minimal .odometer-digit .odometer-value {
    display: block;
    -webkit-transform: translateZ(0);
  }
  .odometer.odometer-auto-theme .odometer-digit .odometer-value.odometer-last-value, .odometer.odometer-theme-minimal .odometer-digit .odometer-value.odometer-last-value {
    position: absolute;
  }
  .odometer.odometer-auto-theme.odometer-animating-up .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-up .odometer-ribbon-inner {
    -webkit-transition: -webkit-transform 2s;
    -moz-transition: -moz-transform 2s;
    -ms-transition: -ms-transform 2s;
    -o-transition: -o-transform 2s;
    transition: transform 2s;
  }
  .odometer.odometer-auto-theme.odometer-animating-up.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-up.odometer-animating .odometer-ribbon-inner {
    -webkit-transform: translateY(-100%);
    -moz-transform: translateY(-100%);
    -ms-transform: translateY(-100%);
    -o-transform: translateY(-100%);
    transform: translateY(-100%);
  }
  .odometer.odometer-auto-theme.odometer-animating-down .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-down .odometer-ribbon-inner {
    -webkit-transform: translateY(-100%);
    -moz-transform: translateY(-100%);
    -ms-transform: translateY(-100%);
    -o-transform: translateY(-100%);
    transform: translateY(-100%);
  }
  .odometer.odometer-auto-theme.odometer-animating-down.odometer-animating .odometer-ribbon-inner, .odometer.odometer-theme-minimal.odometer-animating-down.odometer-animating .odometer-ribbon-inner {
    -webkit-transition: -webkit-transform 2s;
    -moz-transition: -moz-transform 2s;
    -ms-transition: -ms-transform 2s;
    -o-transition: -o-transform 2s;
    transition: transform 2s;
    -webkit-transform: translateY(0);
    -moz-transform: translateY(0);
    -ms-transform: translateY(0);
    -o-transform: translateY(0);
    transform: translateY(0);
  }
  `)

  return (function () {
    const __slice = [].slice
    const VALUE_HTML = '<span class="odometer-value"></span>'
    const RIBBON_HTML = `<span class="odometer-ribbon"><span class="odometer-ribbon-inner">${VALUE_HTML}</span></span>`
    const DIGIT_HTML = `<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">${RIBBON_HTML}</span></span>`
    const FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>'
    const DIGIT_FORMAT = '(,ddd).dd'
    const FORMAT_PARSER = /^\(?([^)]*)\)?(?:(.)(d+))?$/
    const FRAMERATE = 30
    const DURATION = 2000
    const COUNT_FRAMERATE = 20
    const FRAMES_PER_VALUE = 2
    const DIGIT_SPEEDBOOST = 0.5
    const MS_PER_FRAME = 1000 / FRAMERATE
    const COUNT_MS_PER_FRAME = 1000 / COUNT_FRAMERATE
    const TRANSITION_END_EVENTS = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd'
    const transitionCheckStyles = document.createElement('div').style as TransitionCheckStyles
    const TRANSITION_SUPPORT = (transitionCheckStyles.transition != null) || (transitionCheckStyles.webkitTransition != null) || (transitionCheckStyles.mozTransition != null) || (transitionCheckStyles.oTransition != null)
    const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
    const MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver

    function createFromHTML(html: string) {
      const el = document.createElement('div')
      el.innerHTML = html
      return el.children[0]
    }

    function removeClass(el: HTMLDivElement, name: string) {
      return el.className = el.className.replace(new RegExp(`(^| )${name.split(' ').join('|')}( |$)`, 'gi'), ' ')
    }

    function addClass(el: HTMLDivElement, name: string) {
      removeClass(el, name)
      return el.className += ` ${name}`
    }

    function trigger(el: HTMLDivElement, name: string) {
      if (document.createEvent != null) {
        const evt = document.createEvent('HTMLEvents')
        evt.initEvent(name, true, true)
        return el.dispatchEvent(evt)
      }
    }

    function now() {
      const _ref1 = window.performance
      const _ref = _ref1 != null ? typeof _ref1.now === 'function' ? _ref1.now() : undefined : undefined
      return _ref != null ? _ref : +(new Date())
    }

    function round(val: number, precision?: number) {
      if (precision == null)
        precision = 0

      if (!precision)
        return Math.round(val)

      val *= 10 ** precision
      val += 0.5
      val = Math.floor(val)
      return val /= 10 ** precision
    }

    function truncate(val: number) {
      if (val < 0)
        return Math.ceil(val)
      else
        return Math.floor(val)
    }

    function fractionalPart(val: number) {
      return val - round(val)
    }

    return (function () {
      function Odometer(this: any, options: any) {
        let property; let _i; let _len; let _ref2
        const _this = this
        this.options = options
        this.el = this.options.el
        if (this.el.odometer != null)
          return this.el.odometer
        this.el.odometer = _this
        const _base = this.options
        if (_base.duration == null)
          _base.duration = DURATION

        this.MAX_VALUES = ((this.options.duration / MS_PER_FRAME) / FRAMES_PER_VALUE) | 0
        this.resetFormat()
        const _ref1 = this.options.value
        this.value = this.cleanValue(_ref1 != null ? _ref1 : '')
        this.renderInside()
        this.render()
        try {
          _ref2 = ['innerHTML', 'innerText', 'textContent']
          for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
            property = _ref2[_i]
            if (this.el[property] != null) {
              (function (property) {
                return Object.defineProperty(_this.el, property, {
                  get() {
                    if (property === 'innerHTML') { return _this.inside.outerHTML }
                    else {
                      const _ref3 = _this.inside.innerText
                      return _ref3 != null ? _ref3 : _this.inside.textContent
                    }
                  },
                  set(val) {
                    return _this.update(val)
                  },
                })
              })(property)
            }
          }
        }
        catch (_error) {
          this.watchForMutations()
          throw _error
        }
      }

      Odometer.prototype.renderInside = function () {
        this.inside = document.createElement('div')
        this.inside.className = 'odometer-inside'
        this.el.innerHTML = ''
        return this.el.appendChild(this.inside)
      }

      Odometer.prototype.watchForMutations = function () {
        const _this = this
        if (MutationObserver == null)
          return

        if (this.observer == null) {
          this.observer = new MutationObserver(() => {
            const newVal = _this.el.innerText
            _this.renderInside()
            _this.render(_this.value)
            return _this.update(newVal)
          })
        }
        this.watchMutations = true
        return this.startWatchingMutations()
      }

      Odometer.prototype.startWatchingMutations = function () {
        if (this.watchMutations) {
          return this.observer.observe(this.el, {
            childList: true,
          })
        }
      }

      Odometer.prototype.stopWatchingMutations = function () {
        const _ref = this.observer
        return _ref != null ? _ref.disconnect() : undefined
      }

      Odometer.prototype.cleanValue = function (val: string | number) {
        if (typeof val === 'string') {
          const _ref = this.format.radix
          val = val.replace(_ref != null ? _ref : '.', '<radix>')
          val = val.replace(/[.,]/g, '')
          val = val.replace('<radix>', '.')
          val = parseInt(val, 10) || 0
        }
        return round(val, this.format.precision)
      }

      Odometer.prototype.bindTransitionEnd = function () {
        let renderEnqueued: boolean
        const _this = this
        if (this.transitionEndBound)
          return

        this.transitionEndBound = true
        renderEnqueued = false
        const _ref = TRANSITION_END_EVENTS.split(' ')
        const _len = _ref.length
        const _results = []
        for (let _i = 0; _i < _len; _i++) {
          _results.push(this.el.addEventListener(_ref[_i], () => {
            if (renderEnqueued)
              return true

            renderEnqueued = true
            setTimeout(() => {
              _this.render()
              renderEnqueued = false
              return trigger(_this.el, 'odometerdone')
            }, 0)
            return true
          }, false))
        }
        return _results
      }

      Odometer.prototype.resetFormat = function () {
        const _ref = this.options.format
        const format = (_ref != null ? _ref : DIGIT_FORMAT) || 'd'
        const parsed = FORMAT_PARSER.exec(format)
        if (!parsed)
          throw new Error('Odometer: Unparsable digit format')

        const _ref1 = parsed.slice(1, 4); const repeating = _ref1[0]; const radix = _ref1[1]; const fractional = _ref1[2]
        const precision = (fractional != null ? fractional.length : undefined) || 0
        return this.format = {
          repeating,
          radix,
          precision,
        }
      }

      Odometer.prototype.render = function (value: null) {
        let theme = this.options.theme
        if (value == null)
          value = this.value

        this.stopWatchingMutations()
        this.resetFormat()
        this.inside.innerHTML = ''
        const classes = this.el.className.split(' ')
        const newClasses = []
        const _len = classes.length
        for (let _i = 0; _i < _len; _i++) {
          const cls = classes[_i]
          if (!cls.length)
            continue
          const match = /^odometer-theme-(.+)$/.exec(cls)
          if (match) {
            theme = match[1]
            continue
          }
          if (/^odometer(-|$)/.test(cls))
            continue

          newClasses.push(cls)
        }
        newClasses.push('odometer')
        if (!TRANSITION_SUPPORT)
          newClasses.push('odometer-no-transitions')

        if (theme)
          newClasses.push(`odometer-theme-${theme}`)
        else
          newClasses.push('odometer-auto-theme')

        this.el.className = newClasses.join(' ')
        this.ribbons = {}
        this.formatDigits(value)
        return this.startWatchingMutations()
      }

      Odometer.prototype.formatDigits = function (value: number) {
        let digit, valueDigit, valueString, wholePart, _i, _j, _len, _len1, _ref, _ref1
        this.digits = []
        if (this.options.formatFunction) {
          valueString = this.options.formatFunction(value)
          _ref = valueString.split('').reverse()
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            valueDigit = _ref[_i]
            if (valueDigit.match(/0-9/)) {
              digit = this.renderDigit()
              digit.querySelector('.odometer-value').innerHTML = valueDigit
              this.digits.push(digit)
              this.insertDigit(digit)
            }
            else {
              this.addSpacer(valueDigit)
            }
          }
        }
        else {
          wholePart = !this.format.precision || !fractionalPart(value) || false
          _ref1 = value.toString().split('').reverse()
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            digit = _ref1[_j]
            if (digit === '.')
              wholePart = true

            this.addDigit(digit, wholePart)
          }
        }
      }

      Odometer.prototype.update = function (newValue: number) {
        const _this = this
        newValue = this.cleanValue(newValue)
        const diff = newValue - this.value
        if (!diff)
          return

        removeClass(this.el, 'odometer-animating-up odometer-animating-down odometer-animating')
        if (diff > 0)
          addClass(this.el, 'odometer-animating-up')
        else
          addClass(this.el, 'odometer-animating-down')

        this.stopWatchingMutations()
        this.animate(newValue)
        this.startWatchingMutations()
        setTimeout(() => addClass(_this.el, 'odometer-animating'), 0)
        return this.value = newValue
      }

      Odometer.prototype.renderDigit = function () {
        return createFromHTML(DIGIT_HTML)
      }

      Odometer.prototype.insertDigit = function (digit: any, before: null) {
        if (before != null)
          return this.inside.insertBefore(digit, before)
        else if (!this.inside.children.length)
          return this.inside.appendChild(digit)
        else
          return this.inside.insertBefore(digit, this.inside.children[0])
      }

      Odometer.prototype.addSpacer = function (chr: any, before: any, extraClasses: string) {
        const spacer = createFromHTML(FORMAT_MARK_HTML) as HTMLDivElement
        spacer.innerHTML = chr
        if (extraClasses)
          addClass(spacer, extraClasses)

        return this.insertDigit(spacer, before)
      }

      Odometer.prototype.addDigit = function (value: string, repeating: boolean | null) {
        let chr, resetted
        if (repeating == null)
          repeating = true

        if (value === '-')
          return this.addSpacer(value, null, 'odometer-negation-mark')

        if (value === '.') {
          const _ref = this.format.radix
          return this.addSpacer(_ref != null ? _ref : '.', null, 'odometer-radix-mark')
        }

        if (repeating) {
          resetted = false
          while (true) {
            if (!this.format.repeating.length) {
              if (resetted)
                throw new Error('Bad odometer format without digits')

              this.resetFormat()
              resetted = true
            }
            chr = this.format.repeating[this.format.repeating.length - 1]
            this.format.repeating = this.format.repeating.substring(0, this.format.repeating.length - 1)
            if (chr === 'd')
              break

            this.addSpacer(chr)
          }
        }
        const digit = this.renderDigit()
        digit.querySelector('.odometer-value').innerHTML = value
        this.digits.push(digit)
        return this.insertDigit(digit)
      }

      Odometer.prototype.animate = function (newValue: any) {
        if (!TRANSITION_SUPPORT || this.options.animation === 'count')
          return this.animateCount(newValue)
        else
          return this.animateSlide(newValue)
      }

      Odometer.prototype.animateCount = function (newValue: string | number) {
        let cur: number; let tick: FrameRequestCallback
        const _this = this
        const diff = +newValue - this.value
        if (!diff)
          return

        const start = now()
        let last = start
        cur = this.value
        return (tick = function () {
          let dist, fraction
          if ((now() - start) > _this.options.duration) {
            _this.value = newValue
            _this.render()
            trigger(_this.el, 'odometerdone')
            return
          }
          const delta = now() - last
          if (delta > COUNT_MS_PER_FRAME) {
            last = now()
            fraction = delta / _this.options.duration
            dist = diff * fraction
            cur += dist
            _this.render(Math.round(cur))
          }
          if (requestAnimationFrame != null)
            return requestAnimationFrame(tick)
          else
            return setTimeout(tick, COUNT_MS_PER_FRAME)
        })()
      }

      Odometer.prototype.getDigitCount = function (...args: any[]) {
        let i, value, _i, _len
        const values: number[] = args.length >= 1 ? __slice.call(args, 0) : []
        for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
          value = values[i]
          values[i] = Math.abs(value)
        }
        const max = Math.max(...values)
        return Math.ceil(Math.log(max + 1) / Math.log(10))
      }

      Odometer.prototype.getFractionalDigitCount = function (...args: any[]) {
        let _i
        const values: any[] = args.length >= 1 ? __slice.call(args, 0) : []
        const parser = /^\-?\d*\.(\d*?)0*$/
        const _len = values.length
        for (let i = _i = 0; _i < _len; i = ++_i) {
          const value = values[i]
          values[i] = value.toString()
          const parts = parser.exec(values[i])
          if (parts == null)
            values[i] = 0
          else
            values[i] = parts[1].length
        }
        return Math.max(...values)
      }

      Odometer.prototype.resetDigits = function () {
        this.digits = []
        this.ribbons = []
        this.inside.innerHTML = ''
        return this.resetFormat()
      }

      Odometer.prototype.animateSlide = function (newValue: number) {
        let cur; let frame; let frames; let i; let incr; let j; let numEl; let oldValue = this.value; let _i; let _k; let _l; let _len; let _len1; let _len2; let _m; let start: number; let end: number
        const fractionalCount = this.getFractionalDigitCount(oldValue, newValue)
        if (fractionalCount) {
          newValue = newValue * 10 ** fractionalCount
          oldValue = oldValue * 10 ** fractionalCount
        }
        const diff = newValue - oldValue
        if (!diff)
          return

        this.bindTransitionEnd()
        const digitCount = this.getDigitCount(oldValue, newValue)
        const digits = []
        let boosted = 0
        for (i = _i = 0; digitCount >= 0 ? _i < digitCount : _i > digitCount; i = digitCount >= 0 ? ++_i : --_i) {
          start = truncate(oldValue / 10 ** (digitCount - i - 1))
          end = truncate(newValue / 10 ** (digitCount - i - 1))
          const dist = end - start
          if (Math.abs(dist) > this.MAX_VALUES) {
            frames = []
            incr = dist / (this.MAX_VALUES + this.MAX_VALUES * boosted * DIGIT_SPEEDBOOST)
            cur = start
            if (dist > 0) {
              while (cur < end) {
                frames.push(Math.round(cur))
                cur += incr
              }
            }
            else if (dist < 0) {
              while (cur > end) {
                frames.push(Math.round(cur))
                cur += incr
              }
            }

            if (frames[frames.length - 1] !== end)
              frames.push(end)

            boosted++
          }
          else {
            frames = (function () {
              const _results = []
              for (let _j = start; start <= end ? _j <= end : _j >= end; start <= end ? _j++ : _j--) _results.push(_j)
              return _results
            }.apply(this))
          }
          for (i = _k = 0, _len = frames.length; _k < _len; i = ++_k) {
            frame = frames[i]
            frames[i] = Math.abs(frame % 10)
          }
          digits.push(frames)
        }
        this.resetDigits()
        const _ref = digits.reverse()
        for (i = _l = 0, _len1 = _ref.length; _l < _len1; i = ++_l) {
          frames = _ref[i]
          if (!this.digits[i])
            this.addDigit(' ', i >= fractionalCount)
          const _base = this.ribbons
          if (_base[i] == null)
            _base[i] = this.digits[i].querySelector('.odometer-ribbon-inner')

          this.ribbons[i].innerHTML = ''
          if (diff < 0)
            frames = frames.reverse()

          for (j = _m = 0, _len2 = frames.length; _m < _len2; j = ++_m) {
            frame = frames[j]
            numEl = document.createElement('div')
            numEl.className = 'odometer-value'
            numEl.innerHTML = frame as unknown as string
            this.ribbons[i].appendChild(numEl)
            if (j === frames.length - 1)
              addClass(numEl, 'odometer-last-value')

            if (j === 0)
              addClass(numEl, 'odometer-first-value')
          }
        }
        if (start! < 0)
          this.addDigit('-')

        const mark = this.inside.querySelector('.odometer-radix-mark')
        if (mark != null)
          mark.parent.removeChild(mark)

        if (fractionalCount)
          return this.addSpacer(this.format.radix, this.digits[fractionalCount - 1], 'odometer-radix-mark')
      }

      return Odometer as { (options: any): any; new(arg0: { el: any; value: any; format: '(,ddd)' | '(,ddd).dd' | '(.ddd),dd' | '( ddd),dd' | 'd'; theme: 'minimal'; duration: number; animation: 'count' | 'countdown'; auto: boolean }): any; options?: any; init?: any }
    })()
  }.call(this))
}

