/**
 * A label is used for display to the user.
 * This can either be a plain text string,
 * or an object with a translation key and
 * translation replacement variables.
 */
export type Label =
    | string
    | {
          /**
           * String key
           */
          key: string;
          /**
           * String replacement variables
           */
          values?: {
              [k: string]: unknown;
          };
      };
