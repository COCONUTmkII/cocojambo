import { FormGroup } from '@angular/forms';

export class ValidationChecker {
  static checkFormInputIsValid(form: FormGroup, element: string) {
    return form.get(element)?.errors?.['required'] && !form.get(element)?.untouched;
  }
}
