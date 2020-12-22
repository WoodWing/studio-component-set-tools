import { ComponentSet } from '../models';

export abstract class Validator {
    constructor(protected error: (errorMessage: string) => false, protected componentSet: ComponentSet) {}

    /**
     * To be implemented by validator.
     * The implementation should call the error method when validation fails.
     * May be called multiple times.
     */
    abstract validate(): Promise<void>;
}
