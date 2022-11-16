import { nanoid } from 'nanoid';
import {
  pipe,
  map,
  flat,
  toArray,
  entries,
  uniq,
  nth,
  isUndefined,
  each
} from "@fxts/core";

import type { EventMessage } from "types";
import { EventTypes } from "../constants/EventTypes";
import { EXTRACT_ATTRIBUTES } from "../constants/ExtractAttributes";

const ID_PREFIX = 'CE_';
const ID_LENGTH = 7;
const qs = (selector: string) => document.querySelector(selector);
const generateClassName = () => `${ID_PREFIX}${nanoid(ID_LENGTH)}`;
const headEl = qs('head');
const customStyleEl = document.createElement('style');

customStyleEl.innerText = '.ce-highlight { border: 2px solid red; transition: border 300ms ease-out; }';
headEl?.appendChild(customStyleEl);

const getFlatDOM = (el: Element): Element[] => {
  const { children } = el
  if (!children) {
    return [el];
  }
  return pipe(
    [
      el,
      pipe(
        children,
        // TODO: HTMLCollection Type
        map(node => getFlatDOM(node as HTMLElement)),
        flat,
        toArray,
      ),
    ],
    flat,
    toArray,
  )
}

const extract = () => {
  const wrapEl = qs('body');
  if (!wrapEl) {
    throw new Error('Wrapping element not found');
  }
  const result: {
    [key: string]: {
      [subKey: string]: string[]
    }
  } = {};
  pipe(
    getFlatDOM(wrapEl),
    map(node => {
      const nodeComputedStyle = window.getComputedStyle(node)
      const nodeClassName = generateClassName()
      node.classList.add(nodeClassName)
      const computedStyleList = pipe(
        entries(EXTRACT_ATTRIBUTES),
        map(args => {
          const [key, value] = args
          const { attr } = value
          const targetAttributeValue = nodeComputedStyle.getPropertyValue(attr)
          const rgbRegex = /rgba?\((?<r>[.\d]+)[, ]+(?<g>[.\d]+)[, ]+(?<b>[.\d]+)(?:\s?[,\/]\s?(?<a>[.\d]+%?))?\)/g
          return pipe(
            targetAttributeValue.matchAll(rgbRegex),
            map(matches => nth(0, matches)),
            uniq,
            map(colorCode => [key, colorCode, nodeClassName]),
            flat,
          )
        }),
      )
      return computedStyleList
    }),
    flat,
    each(item => {
      const [category, colorCode, className] = item as unknown as [string, string, string];
      const isCategoryExist = !isUndefined(result[category]);
      if (isCategoryExist) {
        const isColorExist = !isUndefined(result[category][colorCode]);
        if (isColorExist) {
          result[category][colorCode].push(className);
          return;
        }
        result[category][colorCode] = [className];
        return;
      }
      result[category] = { [colorCode]: [className] };
    }),
  )
  return result
}

const handleFocus = (className: unknown) => {
  try {
    const targetEl = qs(`.${className as string}`);
    targetEl?.classList.add('ce-highlight');
    targetEl?.scrollIntoView({ behavior: 'smooth' });
    const timerId = setTimeout(() => {
      targetEl?.classList.remove('ce-highlight');
      clearTimeout(timerId);
    }, 3000);
  } catch (error) {
    console.log(error);
  }
};

const messagesFromReactAppListener = (
  msg: EventMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: EventMessage) => void
) => {
  // console.log("[content.js]. Message received", msg);
  const { type, payload } = msg;
  if (type === EventTypes.RUN_EXTRACT) {
    sendResponse({
      type: EventTypes.RUN_EXTRACT,
      payload: { data: extract() }
    });
    return;
  }
  handleFocus(payload?.data);
  sendResponse({
    type: EventTypes.FOCUS,
    payload: { data: 'done' }
  });
  // console.log("[content.js]. Message response");
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
