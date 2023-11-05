const hasNavigator = typeof navigator !== 'undefined';

export const IS_WECHATBROWSER = hasNavigator && /.*Wechat/.test(navigator.userAgent);

export const IS_WXWORKBROWSER = hasNavigator && /.*wxwork/.test(navigator.userAgent);

export const IS_IOS = hasNavigator && typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;

export const IS_APPLE = hasNavigator && /Mac OS X/.test(navigator.userAgent);

export const IS_ANDROID = hasNavigator && /Android/.test(navigator.userAgent);

export const IS_FIREFOX = hasNavigator && /^(?!.*Seamonkey)(?=.*Firefox).*/i.test(navigator.userAgent);

export const IS_SAFARI =
    hasNavigator &&
    // eslint-disable-next-line no-useless-escape
    (/Version\/[\d\.]+.*Safari/.test(navigator.userAgent) || // safari 浏览器
        (IS_APPLE && IS_WXWORKBROWSER)); // mac 版企业微信用的也是safari，但是ua把safari关键词处理掉了
// "modern" Edge was released at 79.x
export const IS_EDGE_LEGACY = hasNavigator && /Edge?\/(?:[0-6][0-9]|[0-7][0-8])(?:\.)/i.test(navigator.userAgent);

// Firefox did not support `beforeInput` until `v87`.
export const IS_FIREFOX_LEGACY = hasNavigator && /^(?!.*Seamonkey)(?=.*Firefox\/(?:[0-7][0-9]|[0-8][0-6])(?:\.)).*/i.test(navigator.userAgent);

export const IS_CHROME = hasNavigator && /Chrome/i.test(navigator.userAgent);

// Native `beforeInput` events don't work well with react on Chrome 75
// and older, Chrome 76+ can use `beforeInput` though.
export const IS_CHROME_LEGACY = hasNavigator && /Chrome?\/(?:[0-7][0-5]|[0-6][0-9])(?:\.)/i.test(navigator.userAgent);

// qq browser
export const IS_QQBROWSER = hasNavigator && /.*QQBrowser/.test(navigator.userAgent);

// UC mobile browser
export const IS_UC_MOBILE = hasNavigator && /.*UCBrowser/.test(navigator.userAgent);

// Check if DOM is available as React does internally.
// https://github.com/facebook/react/blob/master/packages/shared/ExecutionEnvironment.js
export const CAN_USE_DOM = !!(typeof window !== 'undefined' && typeof window.document !== 'undefined' && typeof window.document.createElement !== 'undefined');

// COMPAT: Firefox/Edge Legacy don't support the `beforeinput` event
// Chrome Legacy doesn't support `beforeinput` correctly
export const HAS_BEFORE_INPUT_SUPPORT =
    !IS_QQBROWSER &&
    !IS_CHROME_LEGACY &&
    !IS_EDGE_LEGACY &&
    // globalThis is undefined in older browsers
    typeof globalThis !== 'undefined' &&
    globalThis.InputEvent &&
    // @ts-ignore The `getTargetRanges` property isn't recognized.
    typeof globalThis.InputEvent.prototype.getTargetRanges === 'function';
