export type EventDLQ<T> = T & {
  dlqError: {
    dlqName: string;
    errorCode: Uppercase<string>;
    error: any;
  };
};
