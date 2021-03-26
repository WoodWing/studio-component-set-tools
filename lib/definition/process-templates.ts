/**
 * Each component may support a number of renditions and must always support the html rendition.
 *
 * These renditions are stored in separate html files. To make the work easy for the editor,
 * these templates are inlined to the processed component set definition.
 */
import { ComponentsDefinition, ComponentRendition } from '../models/components-definition';

export interface RenditionComponentTemplates {
    [renditionName: string]: {
        [componentName: string]: Promise<string | undefined>;
    };
}

export type RenditionResolver = (relativePath: string) => Promise<string | undefined>;

const renditionTypes = Object.values(ComponentRendition);

export async function processTemplates(
    renditionResolver: RenditionResolver,
    componentsDefinition: ComponentsDefinition,
): Promise<void> {
    const templates = loadTemplates(renditionResolver, componentsDefinition);

    for (const component of componentsDefinition.components) {
        component.renditions = {};
        for (const rendition of renditionTypes) {
            component.renditions[rendition] = (await templates[rendition][component.name]) ?? '';
        }
    }
}

function loadTemplates(
    renditionResolver: RenditionResolver,
    componentsDefinition: ComponentsDefinition,
): RenditionComponentTemplates {
    return componentsDefinition.components.reduce((acc, component) => {
        for (const renditionType of renditionTypes) {
            acc[renditionType][component.name] = renditionResolver(`templates/${renditionType}/${component.name}.html`);
        }
        return acc;
    }, initRenditionsComponentTemplates());
}

function initRenditionsComponentTemplates(): RenditionComponentTemplates {
    return renditionTypes.reduce((acc, renditionType) => {
        acc[renditionType] = {};
        return acc;
    }, {} as RenditionComponentTemplates);
}
