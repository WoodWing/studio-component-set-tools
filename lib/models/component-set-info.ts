/**
 * Combines information about component related fields.
 * Example:
 * {
 *   body: {

 *      fields: [
 *          {
 *              type: "editable",
 *              contentKey: "text"
 *          }
 *     ]
 *   },
 *   title: {
 *      fields:    [
 *          {
 *              type: "editable",
 *              contentKey: "text"
 *          }
 *      ]
 *   }
 *   ... etc ...
 * }
 */

export interface ComponentField {
    contentKey: string;
    type: string;
    restrictChildren?: string[];
}

/**
 * Simplified component set information, used by custom channel consumers to easily interpret articles.
 */
export interface ComponentSetInfo {
    components: ComponentInfoFields;
}

export interface ComponentInfoFields {
    [component: string]: {
        fields: ComponentField[];
    };
}
