import { pipe, map, toArray } from '@fxts/core';
import { useEffect, useState } from "react";
import { ChakraProvider, Container, Box, Heading, Text } from "@chakra-ui/react";
import { css } from "@emotion/css";

import { EventTypes } from "constants/EventTypes";
import { EXTRACT_ATTRIBUTES_ORDER, EXTRACT_ATTRIBUTES } from "constants/ExtractAttributes";
import type { EventMessage } from "types";

const containerCSS = css({
  minWidth: '500px'
})

const App = () => {
  const [extractionResult, setExtractionResult] = useState({});
  useEffect(() => {
    if (!chrome.tabs) {
      return;
    }
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
          { type: EventTypes.RUN_EXTRACT } as EventMessage,
          (response: EventMessage) => {
            // @ts-ignore
            const { payload: { data } } = response;
            console.log(`Receive Message`);
            setExtractionResult(() => data);
          }
        );
      }
    );
  }, []);

  const handle = () => {

  }

  // NOTE:
  const handle = useCallback(() => () => {

  }, [a,b,c,d,~, z])

  return (
    <ChakraProvider>
      <Container as="main" minWidth={500}>
        <button onClick={() => handle(a)}></button>


        {
          pipe(
            EXTRACT_ATTRIBUTES_ORDER,
            map(attributeName => {
              const { label } = EXTRACT_ATTRIBUTES[attributeName];
              // @ts-ignore
              const target = extractionResult[attributeName];

              return (
                <Box key={`${attributeName}-${label}`} as="section">
                  <Box>
                    <Heading as="h1" size="sm">{label}</Heading>
                  </Box>
                  <Box>
                    {
                      JSON.stringify(target)
                    }
                  </Box>
                </Box>
              )
            }),
            toArray
          )
        }
      </Container>
    </ChakraProvider>
  );
};

export default App;
