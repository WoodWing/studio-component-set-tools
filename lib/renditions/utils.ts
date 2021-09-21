import * as path from 'path';
import { Component, ComponentRendition, ComponentsDefinition, GetFileContentType } from '../models';
import merge = require('lodash.merge');
import { deepFreeze } from '../util/freeze';

export async function loadHtmlRenditions(
    componentsDefinition: ComponentsDefinition,
    getFileContent: GetFileContentType,
): Promise<ComponentsDefinition> {
    const enrichedDefinition = merge({}, componentsDefinition);
    for (const compDef of enrichedDefinition.components) {
        if (!hasRendition(compDef, ComponentRendition.HTML)) {
            await loadRendition(compDef, ComponentRendition.HTML, getFileContent);
        }
    }
    return deepFreeze(enrichedDefinition);
}

function hasRendition(component: Component, rendition: ComponentRendition): boolean {
    return Boolean(component.renditions && rendition in component.renditions);
}

async function loadRendition(
    component: Component,
    rendition: ComponentRendition,
    getFileContent: GetFileContentType,
): Promise<Component> {
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
