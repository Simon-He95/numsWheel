declare global {
  interface Window {
    webkitRequestAnimationFrame: (callback: FrameRequestCallback) => number
    mozRequestAnimationFrame: (callback: FrameRequestCallback) => number
    msRequestAnimationFrame: (callback: FrameRequestCallback) => number
    oRequestAnimationFrame: (callback: FrameRequestCallback) => number
    webkitCancelAnimationFrame: (handle: number) => void
    mozCancelAnimationFrame: (handle: number) => void
    oCancelAnimationFrame: (handle: number) => void
    msCancelAnimationFrame: (handle: number) => void
    webkitIndexedDB: IDBFactory
    mozIndexedDB: IDBFactory
    msIndexedDB: IDBFactory
    indexedDB: IDBFactory
    MutationObserver: MutationObserver
    WebKitMutationObserver: MutationObserver
    MozMutationObserver: MutationObserver
  }
}

export interface NumWheelOptions {
  format: '(,ddd)' | '(,ddd).dd' | '(.ddd),dd' | '( ddd),dd' | 'd'
  startVal: number
  endVal: number
  duration: number
  animation: 'count' | 'countdown'
}

export interface TransitionCheckStyles extends CSSStyleDeclaration {
  webkitTransition: string
  mozTransition: string
  oTransition: string
}
