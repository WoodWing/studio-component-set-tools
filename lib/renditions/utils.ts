import * as path from 'path';
import { ComponentDefinition, ComponentRendition, ComponentsDefinition, GetFileContentType } from '../models';
import cloneDeep = require('lodash.clonedeep');
import { deepFreeze } from '../util/freeze';

export async function loadHtmlRenditions(
    componentsDefinition: ComponentsDefinition,
    getFileContent: GetFileContentType,
): Promise<ComponentsDefinition> {
    const enrichedDefinition = cloneDeep(componentsDefinition);
    for (const compDef of enrichedDefinition.components) {
        if (!hasRendition(compDef, ComponentRendition.HTML)) {
            await loadRendition(compDef, ComponentRendition.HTML, getFileContent);
        }
    }
    return deepFreeze(enrichedDefinition);
}

function hasRendition(component: ComponentDefinition, rendition: ComponentRendition): boolean {
    return Boolean(component.renditions && rendition in component.renditions);
}

async function loadRendition(
    component: ComponentDefinition,
    rendition: ComponentRendition,
    getFileContent: GetFileContentType,
): Promise<ComponentDefinition> {
    if (!component.renditions) {
        component.renditions = {};
    }
    component.renditions[rendition] = (await getFileContent(
        path.normalize(`templates/${rendition}/${component.name}.html`),
        {
            encoding: 'utf8',
        },
    )) as string;
    return component;
}
