import { pipe, map, flat, toArray, entries, fromEntries, uniqBy, nth, groupBy, size } from "@fxts/core";

import type { EventMessage } from "types";
import { EventTypes } from "../constants/EventTypes";
import { EXTRACT_ATTRIBUTES } from "../constants/ExtractAttributes";

const qs = (selector: string) => document.querySelector(selector);

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
  const wrapEl = qs('#__next');
  if (!wrapEl) {
    throw new Error('Wrapping element not found');
  }
  const flatDOMListIter = getFlatDOM(wrapEl);
  const flatDOMComputedStyleListIter = pipe(
    flatDOMListIter,
    map(node => {
      const nodeComputedStyle = window.getComputedStyle(node)
      const computedStyleList = pipe(
        entries(EXTRACT_ATTRIBUTES),
        map(args => {
          const [key, value] = args
          const { label, attr } = value
          const targetAttributeValue = nodeComputedStyle.getPropertyValue(attr)
          const rgbRegex = /rgba?\((?<r>[.\d]+)[, ]+(?<g>[.\d]+)[, ]+(?<b>[.\d]+)(?:\s?[,\/]\s?(?<a>[.\d]+%?))?\)/g
          const isMultiDimension = size(toArray(targetAttributeValue.matchAll(rgbRegex))) > 1

          return pipe(
            targetAttributeValue.matchAll(rgbRegex),
            map(a => nth(0, a)),
            uniqBy(a => nth(0)),
            map((a) => [key, `${key}__${a}`, a, node]),
            flat,
            toArray,
          )
        }),

        toArray
      )
      return computedStyleList
    }),
    flat,
    // @ts-ignore
    groupBy(args => {
      const [key] = args
      return key
    })
  )

  const result = pipe(
    // @ts-ignore
    entries(flatDOMComputedStyleListIter),
    map(args => {
      const [rootKey, list] = args
      const children = pipe(
        list,
        map(values => {
          // @ts-ignore
          const [, subKey, , node] = values
          return [subKey, node]
        }),
        groupBy(sub => {
          const [childKey] = sub
          return childKey
        })
      )

      return [rootKey, children]
    }),
    // @ts-ignore
    fromEntries
  )

  return result
}

const messagesFromReactAppListener = (
  msg: EventMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: EventMessage) => void
) => {
  console.log("[content.js]. Message received", msg);

  const data = extract();

  console.log(data);

  const response: EventMessage = {
    type: EventTypes.RUN_EXTRACT,
    payload: { data }
  };

  console.log("[content.js]. Message response", response);

  sendResponse(response);
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
