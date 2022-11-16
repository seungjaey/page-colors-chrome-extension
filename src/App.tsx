import { pipe, map, toArray, entries, isEmpty, size, sortBy, reverse, nth } from '@fxts/core';
import { useEffect, useState } from "react";
import {
  ChakraProvider,
  Container,
  Box,
  Heading,
  Stack,
  Spinner,
} from "@chakra-ui/react";

import { EventTypes } from "constants/EventTypes";
import { EXTRACT_ATTRIBUTES_ORDER, EXTRACT_ATTRIBUTES } from "constants/ExtractAttributes";
import type { EventMessage } from "types";

import { ColorCode } from 'components/ColorCode';

const App = () => {
  const [extractionResult, setExtractionResult] = useState({});
  const isLoaded = !isEmpty(extractionResult);
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

  const renderResult = () => {
    if (!isLoaded) {
      return (<Spinner size="lg" color='red.500' />);
    }
    return pipe(
      EXTRACT_ATTRIBUTES_ORDER,
      map(attributeName => {
        const { label } = EXTRACT_ATTRIBUTES[attributeName];
        const resultCategoryEntries = pipe(
          // @ts-ignore
          entries(extractionResult[attributeName]),
          toArray,
        );
        return (
          <Stack key={`${attributeName}-${label}`} as="section" mb="16px">
            <Heading as="h1" size="sm">{label}</Heading>
            {
              pipe(
                resultCategoryEntries,
                map(args => {
                  const [key, values] = args;
                  const length = size(values);
                  return [key, values, length];
                }),
                sortBy(args => nth(3, args)),
                map(args => {
                  const [key, values, length] = args;
                  // @ts-node
                  const [, colorCode] = (key as string).split('__');
                  return (
                    // @ts-ignore
                    <Box key={`${attributeName}-${label}-${key as string}`}>
                      <ColorCode code={colorCode} count={length} />
                    </Box>
                  );
                }),
                toArray,
              )
            }
          </Stack>
        );
      }),
      toArray
    );
  }

  return (
    <ChakraProvider>
      <Container as="main" minWidth="200px" padding="16px">
        {renderResult()}
      </Container>
    </ChakraProvider>
  );
};

export default App;
