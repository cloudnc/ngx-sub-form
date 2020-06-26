import { FormatErrorPipe } from './ngx-error.pipe';
import { errorDefaultMessages } from './ngx-error-default-messages';
import uuid from 'uuid';

describe(FormatErrorPipe.name, () => {
  let pipe!: FormatErrorPipe;
  let errorObject: any;
  let definedErrorMessageKey: string | undefined;
  let displayName: string | undefined;
  const getActualValue = () => pipe.transform(errorObject, displayName);

  describe(FormatErrorPipe.prototype.transform.name, () => {
    beforeAll(() => {
      pipe = new FormatErrorPipe(errorDefaultMessages);
    });
    describe('a successful transformation', () => {
      describe('GIVEN error object has a member matching a defined error message key', () => {
        beforeEach(() => {
          definedErrorMessageKey = 'required';
          errorObject = { [definedErrorMessageKey]: uuid.v4() };
        });

        describe('WHEN optional field name is falsey', () => {
          let expectedErrorMessageWithoutDisplayName: any;

          beforeEach(() => {
            displayName = undefined;
            expectedErrorMessageWithoutDisplayName = new RegExp(definedErrorMessageKey!, 'i');
          });

          it('returns the defined message for the defined error key', () => {
            expect(expectedErrorMessageWithoutDisplayName.test(getActualValue())).toBe(true);
          });
        });

        describe('WHEN optional display name is truthy', () => {
          let expectedErrorMessageWithDisplayName: any;
          beforeEach(() => {
            displayName = uuid.v4();
            expectedErrorMessageWithDisplayName = new RegExp(`${displayName}.*${definedErrorMessageKey}`, 'i');
          });
          it('returns the defined message with the display name', () => {
            expect(expectedErrorMessageWithDisplayName.test(getActualValue())).toBe(true);
          });
        });
      });
    });

    describe('GIVEN edge cases', () => {
      describe('WHEN error object is falsey but error key is one of defined messages', () => {
        beforeEach(() => {
          errorObject = null;
          definedErrorMessageKey = 'required';
        });
        it('returns an empty string', () => {
          expect(getActualValue()).toBe('');
        });
      });

      describe('WHEN error object is falsey and error key is falsey', () => {
        beforeEach(() => {
          errorObject = null;
          definedErrorMessageKey = undefined;
        });
        it('returns an empty string', () => {
          expect(getActualValue()).toBe('');
        });
      });

      describe('WHEN error object is truthy but has no members matching a defined key', () => {
        beforeEach(() => {
          errorObject = { [uuid.v4()]: true };
          definedErrorMessageKey = 'required';
        });
        it('returns an empty string', () => {
          expect(getActualValue()).toBe('');
        });
      });
    });
  });
});
