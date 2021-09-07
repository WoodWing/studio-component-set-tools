import { Label } from './label';

export type ComponentPropertyControl =
    | ComponentPropertyControlSelect
    | ComponentPropertyControlRadio
    | ComponentPropertyControlCheckbox
    | ComponentPropertyControlDisableFullscreenCheckbox
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
    | ComponentPropertyControlUrl
    | ComponentPropertyControlSlider;

/**
 * Dropdown with fixed number of options
 */
export interface ComponentPropertyControlSelect {
    type: 'select';
    dynamicCaptions?: boolean;
    options: {
        caption: Label;

        /**
         * Value of the item. Omit it if the option should simply clean the property up
         */
        value?: string;
    }[];
}
export function isSelect(control: ComponentPropertyControl): control is ComponentPropertyControlSelect {
    return control.type === 'select';
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
export function isRadio(control: ComponentPropertyControl): control is ComponentPropertyControlRadio {
    return control.type === 'radio';
}

/**
 * Checkbox toggling between value and no value
 */
export interface ComponentPropertyControlCheckbox {
    type: 'checkbox';
    value: string;
}
export function isCheckbox(control: ComponentPropertyControl): control is ComponentPropertyControlCheckbox {
    return control.type === 'checkbox';
}

/**
 * Checkbox toggling between value and no value with additional checking of link directives. The property is set and disabled if the component has a non empty link directive
 */
export interface ComponentPropertyControlDisableFullscreenCheckbox {
    type: 'disable-fullscreen-checkbox';
}
export function isDisableFullscreenCheckbox(
    control: ComponentPropertyControl,
): control is ComponentPropertyControlDisableFullscreenCheckbox {
    return control.type === 'disable-fullscreen-checkbox';
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
export function isText(control: ComponentPropertyControl): control is ComponentPropertyControlText {
    return control.type === 'text';
}

/**
 * Time field property
 */
export interface ComponentPropertyControlTime {
    type: 'time';
    [k: string]: unknown;
}
export function isTime(control: ComponentPropertyControl): control is ComponentPropertyControlTime {
    return control.type === 'time';
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
export function isColorPicker(control: ComponentPropertyControl): control is ComponentPropertyControlColorPicker {
    return control.type === 'colorPicker';
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
export function isImageEditor(control: ComponentPropertyControl): control is ComponentPropertyControlImageEditor {
    return control.type === 'image-editor';
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
export function isDropCapital(control: ComponentPropertyControl): control is ComponentPropertyControlDropCapital {
    return control.type === 'drop-capital';
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
export function isMediaProperties(
    control: ComponentPropertyControl,
): control is ComponentPropertyControlMediaProperties {
    return control.type === 'media-properties';
}

/**
 * Enables fitting option for an image directive
 */
export interface ComponentPropertyControlFitting {
    type: 'fitting';
}
export function isFitting(control: ComponentPropertyControl): control is ComponentPropertyControlFitting {
    return control.type === 'fitting';
}

/**
 * Adds slides section to component properties (for doc-slideshow)
 */
export interface ComponentPropertyControlSlides {
    type: 'slides';
    /**
     * List of properties to include from active slide component properties
     */
    include?: string[];
    /**
     * List of properties to exclude from active slide component properties
     */
    exclude?: string[];
}
export function isSlides(control: ComponentPropertyControl): control is ComponentPropertyControlSlides {
    return control.type === 'slides';
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
        [k: string]: unknown;
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
export function isInteractive(control: ComponentPropertyControl): control is ComponentPropertyControlInteractive {
    return control.type === 'interactive';
}

/**
 * Adds a header at property position
 */
export interface ComponentPropertyControlHeader {
    type: 'header';
}
export function isHeader(control: ComponentPropertyControl): control is ComponentPropertyControlHeader {
    return control.type === 'header';
}

/**
 * Textarea field property
 */
export interface ComponentPropertyControlTextArea {
    type: 'textarea';
    inputPlaceholder?: Label;
}
export function isTextarea(control: ComponentPropertyControl): control is ComponentPropertyControlTextArea {
    return control.type === 'textarea';
}

/**
 * Url field property
 */
export interface ComponentPropertyControlUrl {
    type: 'url';
    inputPlaceholder?: Label;
}
export function isUrl(control: ComponentPropertyControl): control is ComponentPropertyControlUrl {
    return control.type === 'url';
}

/**
 * Slider field property
 */
export interface ComponentPropertyControlSlider {
    type: 'slider';
    minValue: number;
    maxValue: number;
    stepSize: number;
}
export function isSlider(control: ComponentPropertyControl): control is ComponentPropertyControlSlider {
    return control.type === 'slider';
}

/**
 * Fitting property possible values
 */
export const COMPONENT_PROPERTY_CONTROL_FITTING_VALUES = {
    FRAME_HEIGHT_TO_CONTENT_TYPE: '_fit-frame-height-to-content',
    FRAME_TO_CONTENT_TYPE: '_fit-frame-to-content',
};
