import { useEffect, useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";
import logo from "logo.svg";
import { css } from "@emotion/css";

import type { DOMMessage, DOMMessageResponse } from "types";

const App = () => {
  const [title, setTitle] = useState("");
  const [headlines, setHeadlines] = useState<string[]>([]);

  useEffect(() => {
    chrome.tabs &&
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          /**
           * Sends a single message to the content script(s) in the specified tab,
           * with an optional callback to run when a response is sent back.
           *
           * The runtime.onMessage event is fired in each content script running
           * in the specified tab for the current extension.
           */
          chrome.tabs.sendMessage(
            tabs[0].id || 0,
            { type: "GET_DOM" } as DOMMessage,
            (response: DOMMessageResponse) => {
              setTitle(response.title);
              setHeadlines(response.headlines);
            }
          );
        }
      );
  }, []);

  return (
    <ChakraProvider>
      <div className="App" css={css({ backgroundColor: "red" })}>
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
    </ChakraProvider>
  );
};

export default App;
