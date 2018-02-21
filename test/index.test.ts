import { validateFolder } from '../lib/index';

describe("validateFolder", () => {
    it("Should pass on minimal sample", async () => {
        expect(await validateFolder('./test/resources/minimal-sample')).toBe(true);
    });
});