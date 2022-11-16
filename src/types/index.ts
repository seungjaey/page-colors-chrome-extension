import {ExtractAttributeName} from "../constants/ExtractAttributes";

export type EventTypeNames = 'RUN_EXTRACT';

export interface EventPayload {
  data: unknown;
}

export interface EventMessage {
  type: EventTypeNames;
  payload?: EventPayload;
}

export interface ExtractionResultItem {
  [key: string]: string[];
}

export type ExtractionResult = Record<ExtractAttributeName, ExtractionResultItem>;
