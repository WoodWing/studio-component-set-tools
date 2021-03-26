/**
 * Combines information about components, includes label, iconUrl
 * and component related fields
 * label and iconUrl are extracted from component-definition.json file, while fields are loaded from html templates
 * Example:
 * {
 *   body: {
 *      label: { "key": "BODY_EDITOR_LABEL" },
 *      iconUrl: "icons/components/body.svg",
 *      fields: [
 *          {
 *              type: "editable",
 *              contentKey: "text"
 *          }
 *     ]
 *   },
 *   title: {
 *      label: { "key": "STORIES_TITLE_LABEL" },
 *      iconUrl: "icons/components/title.svg",
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
export interface ComponentSetFields {
    [component: string]: InnerComponentFields;
}

export interface PartialComponentSetFields {
    [component: string]: Partial<InnerComponentFields>;
}

export interface InnerComponentFields {
    label: string;
    iconUrl: string;
    fields: ComponentField[];
}

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
