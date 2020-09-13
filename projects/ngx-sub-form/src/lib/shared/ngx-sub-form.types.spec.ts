import { FormControl, FormGroup } from '@angular/forms';
import { TypedFormGroup } from 'ngx-sub-form';

describe(`TypedFormGroup`, () => {
  it(`should be assignable to the base @angular/forms FormGroup`, () => {
    let formGroup: FormGroup;

    const typedFormGroup = new FormGroup({ foo: new FormControl() }) as TypedFormGroup<{ foo: true }>;

    formGroup = typedFormGroup;

    expect(true).toBe(true); // this is a type-only test, if the type breaks the test will not compile
  });
});
