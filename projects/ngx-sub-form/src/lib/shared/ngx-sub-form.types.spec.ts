import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { TypedFormGroup } from 'ngx-sub-form';

describe(`TypedFormGroup`, () => {
  it(`should be assignable to the base @angular/forms FormGroup`, () => {
    let formGroup: UntypedFormGroup;

    const typedFormGroup = new UntypedFormGroup({ foo: new UntypedFormControl() }) as TypedFormGroup<{ foo: true }>;

    formGroup = typedFormGroup;

    expect(true).toBe(true); // this is a type-only test, if the type breaks the test will not compile
  });
});
