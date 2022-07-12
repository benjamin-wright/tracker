import { toRFC3339String } from "./date";

describe('toRFC3339String', () => {
    it('should create the proper string', () => {
        expect(
            toRFC3339String(
                new Date('2022-05-25T12:34:56.789Z')
            )
        ).toEqual('2022-05-25T12:34');
    });
});