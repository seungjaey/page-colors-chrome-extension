export type EventTypeNames = 'RUN_EXTRACT' | 'FOCUS';

export interface EventPayload {
  data: unknown;
}

export interface EventMessage {
  type: EventTypeNames;
  payload?: EventPayload;
}

export interface ExtractionResult {
  [key: string]: {
    [subKey: string]: string[]
  }
}

export type ExtractedDOMColor = [string, string, string]