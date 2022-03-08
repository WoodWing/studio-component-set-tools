import { ComponentPropertyDataType } from '.';

/**
 * Simplified component set information, used by custom channel consumers to easily interpret articles.
 */
export interface ComponentSetInfo {
    components: ComponentInfoFields;
}

export interface ComponentInfoFields {
    [component: string]: {
        fields: ComponentField[];
        properties: ComponentInfoProperty[];
    };
}

export interface ComponentField {
    contentKey: string;
    type: string;
    restrictChildren?: string[];
}

export interface ComponentInfoProperty {
    name: string;
    dataType: ComponentPropertyDataType;
}
