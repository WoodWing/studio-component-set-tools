import * as path from 'path';
import { ComponentDefinition, ComponentRendition, ComponentsDefinition, GetFileContentType } from '../models';

export async function loadHtmlRenditions(
    componentsDefinition: ComponentsDefinition,
    getFileContent: GetFileContentType,
): Promise<ComponentsDefinition> {
    return {
        ...componentsDefinition,
        components: await loadRenditionsForComponents(componentsDefinition.components, getFileContent),
    };
}

async function loadRenditionsForComponents(components: ComponentDefinition[], getFileContent: GetFileContentType) {
    const enrichedComponents: ComponentDefinition[] = [];
    for (const compDef of components) {
        if (!hasRendition(compDef, ComponentRendition.HTML)) {
            enrichedComponents.push({
                ...compDef,
                renditions: await loadRendition(compDef.name, ComponentRendition.HTML, getFileContent),
            });
        }
    }
    return enrichedComponents;
}

function hasRendition(component: ComponentDefinition, rendition: ComponentRendition): boolean {
    return Boolean(component.renditions && rendition in component.renditions);
}

async function loadRendition(
    componentName: string,
    rendition: ComponentRendition,
    getFileContent: GetFileContentType,
): Promise<ComponentDefinition['renditions']> {
    const renditions: ComponentDefinition['renditions'] = {};
    renditions[rendition] = (await getFileContent(path.normalize(`templates/${rendition}/${componentName}.html`), {
        encoding: 'utf8',
    })) as string;
    return renditions;
}
