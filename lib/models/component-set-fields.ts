/**
 * Combines information about components, includes label, iconUrl
 * and component related fields
 * label and iconUrl are extracted from component-definition.json file, while fields are loaded from html templates
 * Example:
 * {
 *   body: {
 *      label: "{{ 'BODY_EDITOR_LABEL' | translate }}",
 *      iconUrl: "https://bucketName.s3.amazonaws.com/tenant/1234-1234-1234-1234/content/icons/body.svg?v=1",
 *      fields: [
 *          {
 *              type: "editable",
 *              contentKey: "text"
 *          }
 *     ]
 *   },
 *   title: {
 *      label: "{{ 'STORIES_TITLE_LABEL' | translate }}",
 *      iconUrl: "https://bucketName.s3.amazonaws.com/tenant/1234-1234-1234-1234/content/icons/title.svg?v=1",
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
