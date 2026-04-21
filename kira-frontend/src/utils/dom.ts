/**
 * DOM Utilities
 * Helper functions for DOM manipulation and querying
 */

/**
 * Query selector with null safety
 */
export function query<T extends Element = Element>(selector: string, parent: Document | Element = document): T | null {
  return (parent.querySelector(selector) as T) || null;
}

/**
 * Query all elements
 */
export function queryAll<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T[] {
  return Array.from(parent.querySelectorAll(selector) as NodeListOf<T>);
}

/**
 * Create element with attributes and content
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  options?: {
    id?: string;
    class?: string | string[];
    attrs?: Record<string, string>;
    text?: string;
    html?: string;
  }
): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);

  if (options?.id) el.id = options.id;

  if (options?.class) {
    const classes = Array.isArray(options.class) ? options.class : [options.class];
    el.classList.add(...classes);
  }

  if (options?.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      el.setAttribute(key, value);
    });
  }

  if (options?.text) {
    el.textContent = options.text;
  } else if (options?.html) {
    el.innerHTML = options.html;
  }

  return el;
}

/**
 * Add classes to element
 */
export function addClass(el: Element, ...classes: string[]): void {
  el.classList.add(...classes);
}

/**
 * Remove classes from element
 */
export function removeClass(el: Element, ...classes: string[]): void {
  el.classList.remove(...classes);
}

/**
 * Toggle class on element
 */
export function toggleClass(el: Element, className: string, force?: boolean): boolean {
  return el.classList.toggle(className, force);
}

/**
 * Check if element has class
 */
export function hasClass(el: Element, className: string): boolean {
  return el.classList.contains(className);
}

/**
 * Set attributes on element
 */
export function setAttributes(el: Element, attrs: Record<string, string>): void {
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, value);
  });
}

/**
 * Get attribute value
 */
export function getAttribute(el: Element, attr: string): string | null {
  return el.getAttribute(attr);
}

/**
 * Set element text content
 */
export function setText(el: Element, text: string): void {
  el.textContent = text;
}

/**
 * Set element HTML
 */
export function setHTML(el: Element, html: string): void {
  el.innerHTML = html;
}

/**
 * Get element width
 */
export function getWidth(el: Element): number {
  const rect = el.getBoundingClientRect();
  return rect.width;
}

/**
 * Get element height
 */
export function getHeight(el: Element): number {
  const rect = el.getBoundingClientRect();
  return rect.height;
}

/**
 * Get element offset relative to parent
 */
export function getOffset(el: Element, parent?: Element): { top: number; left: number } {
  const rect = el.getBoundingClientRect();
  const parentRect = parent?.getBoundingClientRect() || { top: 0, left: 0 };

  return {
    top: rect.top - parentRect.top,
    left: rect.left - parentRect.left,
  };
}

/**
 * Show element
 */
export function show(el: Element): void {
  removeClass(el, 'hidden');
  el.removeAttribute('hidden');
}

/**
 * Hide element
 */
export function hide(el: Element): void {
  addClass(el, 'hidden');
  el.setAttribute('hidden', '');
}

/**
 * Toggle visibility
 */
export function toggleVisibility(el: Element, show?: boolean): void {
  if (show === undefined) {
    toggleClass(el, 'hidden');
  } else if (show) {
    show(el);
  } else {
    hide(el);
  }
}

/**
 * Add event listener with auto cleanup
 */
export function on<K extends keyof HTMLElementEventMap>(
  el: Element,
  event: K,
  handler: (this: Element, ev: HTMLElementEventMap[K]) => any,
  options?: boolean | AddEventListenerOptions
): () => void {
  el.addEventListener(event, handler as EventListener, options);

  // Return unsubscribe function
  return () => {
    el.removeEventListener(event, handler as EventListener, options);
  };
}

/**
 * Add one-time event listener
 */
export function once<K extends keyof HTMLElementEventMap>(
  el: Element,
  event: K,
  handler: (this: Element, ev: HTMLElementEventMap[K]) => any
): void {
  const wrapper = function (this: Element, ev: HTMLElementEventMap[K]) {
    handler.call(this, ev);
    el.removeEventListener(event, wrapper as EventListener);
  };

  el.addEventListener(event, wrapper as EventListener);
}

/**
 * Wait for element to appear in DOM
 */
export async function waitForElement(selector: string, timeout: number = 5000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const el = query(selector);
    if (el) {
      resolve(el);
      return;
    }

    const observer = new MutationObserver(() => {
      const el = query(selector);
      if (el) {
        observer.disconnect();
        clearTimeout(timeoutId);
        resolve(el);
      }
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });
}

/**
 * Scroll to element
 */
export function scrollToElement(el: Element, smooth: boolean = true): void {
  el.scrollIntoView({
    behavior: smooth ? 'smooth' : 'auto',
    block: 'start',
  });
}

/**
 * Focus element
 */
export function focus(el: Element): void {
  (el as HTMLElement).focus();
}

/**
 * Blur element
 */
export function blur(el: Element): void {
  (el as HTMLElement).blur();
}

/**
 * Get form data as object
 */
export function getFormData(form: HTMLFormElement): Record<string, FormDataEntryValue | FormDataEntryValue[]> {
  const formData = new FormData(form);
  const data: Record<string, FormDataEntryValue | FormDataEntryValue[]> = {};

  for (const [key, value] of formData.entries()) {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        (data[key] as FormDataEntryValue[]).push(value);
      } else {
        data[key] = [data[key] as FormDataEntryValue, value];
      }
    } else {
      data[key] = value;
    }
  }

  return data;
}

/**
 * Debounced scroll handler
 */
export function onScroll(handler: () => void, delayMs: number = 300): () => void {
  let timeoutId: NodeJS.Timeout;

  const scrollHandler = () => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(handler, delayMs);
  };

  window.addEventListener('scroll', scrollHandler);

  return () => {
    clearTimeout(timeoutId);
    window.removeEventListener('scroll', scrollHandler);
  };
}

/**
 * Detect if element is in viewport
 */
export function isInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

export default {
  query,
  queryAll,
  createElement,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setAttributes,
  getAttribute,
  setText,
  setHTML,
  getWidth,
  getHeight,
  getOffset,
  show,
  hide,
  toggleVisibility,
  on,
  once,
  waitForElement,
  scrollToElement,
  focus,
  blur,
  getFormData,
  onScroll,
  isInViewport,
};
