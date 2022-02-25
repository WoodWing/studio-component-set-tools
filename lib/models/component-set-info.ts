/**
 * Simplified component set information, used by custom channel consumers to easily interpret articles.
 */
export interface ComponentSetInfo {
    components: ComponentInfoFields;
    componentProperties: ComponentInfoProperties;
}

export interface ComponentInfoFields {
    [component: string]: {
        fields: ComponentField[];
    };
}

export interface ComponentField {
    contentKey: string;
    type: string;
    restrictChildren?: string[];
}

export interface ComponentInfoProperties {
    [property: string]: {
        dataType: string;
    };
}
