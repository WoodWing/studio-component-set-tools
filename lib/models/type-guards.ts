import { ComponentPropertyControl, ComponentPropertyControlSelect } from './component-property-controls';

export function supportsDynamicCaptions(control: ComponentPropertyControl): control is ComponentPropertyControlSelect {
    return ['select'].includes(control.type);
}
