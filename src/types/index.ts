export type EventTypeNames = 'RUN_EXTRACT';

export interface EventPayload {
  data: unknown;
}

export interface EventMessage {
  type: EventTypeNames;
  payload?: EventPayload;
}
