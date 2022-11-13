import { pipe, map, flat, toArray } from "@fxts/core";

export type DOMMessage = {
  type: "GET_DOM";
};

export type DOMMessageResponse = {
  title: string;
  headlines: string[];
};

const qs = (selector: string) => document.querySelector(selector);
const qsa = (selector: string) => document.querySelectorAll(selector);

const getFlatDOM = (el: HTMLElement): HTMLElement[] => {
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

const messagesFromReactAppListener = (
  msg: DOMMessage,
  sender: chrome.runtime.MessageSender,
  sendResponse: (response: DOMMessageResponse) => void
) => {
  console.log("[content.js]. Message received", msg);

  const bodyEl = qs('body')
  const flatElements = getFlatDOM(bodyEl as HTMLBodyElement);

  console.log(flatElements);


  const response: DOMMessageResponse = {
    title: document.title,
    headlines: Array.from(document.getElementsByTagName<"h1">("h1")).map(
      (h1) => h1.innerText
    ),
  };

  console.log("[content.js]. Message response", response);

  sendResponse(response);
};

/**
 * Fired when a message is sent from either an extension process or a content script.
 */
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
