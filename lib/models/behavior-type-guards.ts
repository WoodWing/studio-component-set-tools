import { ComponentPropertyControl, ComponentPropertyControlSelect } from './component-property-controls';

type ComponentPropertyControlWithDynamicCaptions = ComponentPropertyControlSelect;
export function supportsDynamicCaptions(
    control: ComponentPropertyControl,
): control is ComponentPropertyControlWithDynamicCaptions {
    return ['select'].includes(control.type);
}
