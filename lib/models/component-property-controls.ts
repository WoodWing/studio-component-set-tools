import { Label } from './label';

export type ComponentPropertyControl =
    | ComponentPropertyControlSelect
    | ComponentPropertyControlRadio
    | ComponentPropertyControlCheckbox
    | ComponentPropertyControlText
    | ComponentPropertyControlTime
    | ComponentPropertyControlColorPicker
    | ComponentPropertyControlImageEditor
    | ComponentPropertyControlDropCapital
    | ComponentPropertyControlMediaProperties
    | ComponentPropertyControlFitting
    | ComponentPropertyControlSlides
    | ComponentPropertyControlInteractive
    | ComponentPropertyControlHeader
    | ComponentPropertyControlTextArea
    | ComponentPropertyControlUrl;

/**
 * Dropdown with fixed number of options
 */
export interface ComponentPropertyControlSelect {
    type: 'select';
    options: {
        caption: Label;

        /**
         * Value of the item. Omit it if the option should simply clean the property up
         */
        value?: string;
    }[];
}

/**
 * Radio control type with fixed number of options
 */
export interface ComponentPropertyControlRadio {
    type: 'radio';
    options: {
        caption: Label;

        /**
         * Icon shown for the option
         */
        icon: string;

        /**
         * Value of the item. Omit it if the option should simply clean the property up
         */
        value?: string;
    }[];
}

/**
 * Checkbox toggling between value and no value
 */
export interface ComponentPropertyControlCheckbox {
    type: 'checkbox';
    value: string;
}

/**
 * Text field property.
 */
export interface ComponentPropertyControlText {
    /**
     * Text field property
     */
    type: 'text';
    /**
     * Value validation regexp pattern
     */
    pattern?: string;
    /**
     * Default value which is used instead of empty value
     */
    defaultValue?: string;
    /**
     * Unit type like em, px etc
     */
    unit?: string;
    inputPlaceholder?: Label;
    /**
     * Makes the text field read only from the editor UI
     */
    readonly?: boolean;
}

/**
 * Time field property
 */
export interface ComponentPropertyControlTime {
    type: 'time';
    [k: string]: any;
}

/**
 * Color picker field property
 */
export interface ComponentPropertyControlColorPicker {
    type: 'colorPicker';

    /**
     * Enable opacity setting
     */
    opacity?: boolean;
}

/**
 * Image editor control. Adds a button opening the image edit tools.
 */
export interface ComponentPropertyControlImageEditor {
    /**
     * Image editor field property
     */
    type: 'image-editor';

    /**
     * Enable focuspoint feature
     */
    focuspoint?: boolean;
}

/**
 * Drop capital field property
 */
export interface ComponentPropertyControlDropCapital {
    type: 'drop-capital';

    /**
     * Minimum value of characters number
     */
    charactersMinimum?: number;
    /**
     * Default value of characters number
     */
    charactersDefault?: number;
    /**
     * Maximum value of characters number
     */
    charactersMaximum?: number;
    /**
     * Minimum value of lines number
     */
    linesMinimum?: number;
    /**
     * Default value of lines number
     */
    linesDefault?: number;
    /**
     * Maximum value of lines number
     */
    linesMaximum?: number;
}

/**
 * Media properties control.
 * Contains a sub list of dynamically managed properties based on the media type
 * of the attached component doc-media directive.
 */
export interface ComponentPropertyControlMediaProperties {
    type: 'media-properties';
    /**
     * Defines media type. If omitted then both types are supported
     */
    mediaType?: 'video' | 'social';
}

/**
 * Enables fitting option for an image directive
 */
export interface ComponentPropertyControlFitting {
    type: 'fitting';
}
/**
 * Adds slides section to component properties (for doc-slideshow)
 */
export interface ComponentPropertyControlSlides {
    type: 'slides';
    /**
     * List of properties to include from active slide component properties
     */
    include?: any[];
    /**
     * List of properties to exclude from active slide component properties
     */
    exclude?: any[];
}

/**
 * Configuration of interactive directive
 */
export interface ComponentPropertyControlInteractive {
    type: 'interactive';
    /**
     * Default configuration of interactive directive
     */
    defaultConfig: {
        [k: string]: any;
    };
    /**
     * A link which is used to edit the configuration
     */
    editLink?: string;
    /**
     * A link which is used to show the directive
     */
    viewLink: string;
}

/**
 * Adds a header at property position
 */
export interface ComponentPropertyControlHeader {
    type: 'header';
}

/**
 * Textarea field property
 */
export interface ComponentPropertyControlTextArea {
    type: 'textarea';
    inputPlaceholder?: Label;
}

/**
 * Url field property
 */
export interface ComponentPropertyControlUrl {
    type: 'url';
    inputPlaceholder?: Label;
}

/**
 * Fitting property possible values
 */
export const COMPONENT_PROPERTY_CONTROL_FITTING_VALUES = {
    FRAME_HEIGHT_TO_CONTENT_TYPE: '_fit-frame-height-to-content',
    FRAME_TO_CONTENT_TYPE: '_fit-frame-to-content',
};
