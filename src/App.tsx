import { pipe, map, toArray, entries, isEmpty, size, sortBy, reverse } from '@fxts/core';
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ChakraProvider,
  Container,
  Box,
  Heading,
  Stack,
  Spinner,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Text,
  Button,
} from "@chakra-ui/react";

import { EventTypes } from "constants/EventTypes";
import { EXTRACT_ATTRIBUTES_ORDER, EXTRACT_ATTRIBUTES } from "constants/ExtractAttributes";
import type { EventMessage, ExtractionResult } from "types";

const App = () => {
  const [extractionResult, setExtractionResult] = useState<ExtractionResult>({});
  const isLoaded = !isEmpty(extractionResult);

  const handleClickButton = useCallback((className: string) => () => {
    console.log(className);
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
          { type: EventTypes.FOCUS, payload: { data: className } } as EventMessage
        );
      }
    );
  }, []);

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
        const resultCategoryEntries = entries(extractionResult[attributeName]);

        return (
          <Stack key={`${attributeName}-${label}`} as="section" mb="16px">
            <Heading as="h1" size="sm">{label}</Heading>
            <Accordion allowMultiple allowToggle>
              {
                pipe(
                  resultCategoryEntries,
                  sortBy(args => {
                    const [, values] = args;
                    return size(values);
                  }),
                  reverse,
                  map(args => {
                    const [colorCode, values] = args;
                    return (
                      <AccordionItem>
                        <h2>
                          <AccordionButton
                            display="flex"
                            flexDirection="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Box
                              display="flex"
                              flexDirection="row"
                              alignItems="center"
                              justifyContent="flex-start"
                            >
                              <Box
                                width="25px"
                                height="25px"
                                backgroundColor={colorCode as string}
                                borderRadius="100%"
                                marginRight="4px"
                              />
                              <Text size="sm">
                                {`${colorCode} _ ${size(values)}`}
                              </Text>
                            </Box>
                            <AccordionIcon />
                          </AccordionButton>
                        </h2>
                        <AccordionPanel pb={4}>
                          <Stack>
                            {
                              pipe(
                                values,
                                map(className => {
                                  return (
                                    <Button
                                      key={`${attributeName}-${label}-${colorCode}-${className}`}
                                      variant='ghost'
                                      onClick={handleClickButton(className)}
                                    >
                                      {className}
                                    </Button>
                                  )
                                }),
                                toArray,
                              )
                            }
                          </Stack>
                        </AccordionPanel>
                      </AccordionItem>
                    );
                  }),
                  toArray,
                )
              }
            </Accordion>
          </Stack>
        );
      }),
      toArray
    );
  }

  return (
    <ChakraProvider>
      <Container as="main" minWidth="400px" padding="8px" transition="width, height 300ms ease-out">
        {renderResult()}
      </Container>
    </ChakraProvider>
  );
};

export default App;
