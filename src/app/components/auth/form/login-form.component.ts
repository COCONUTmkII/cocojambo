import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {ValidationChecker} from "../../../util/validation";
import {Router} from "@angular/router";

@Component({
  selector: 'app-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss']
})
export class LoginFormComponent implements OnInit{
  signInForm: FormGroup = new FormGroup({});

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit() {
    this.signInForm = this.fb.group({
      username: new FormControl('', Validators.required),
      password: new FormControl('', Validators.required)
    });
  }

  submit(): void {
    console.log(this.signInForm.value);
  }

  forwardToMainPage(): void {
    this.router.navigateByUrl('/main').then(() => {
      //ignored
    });
  }

  checkFormRequiredInput(element: string) {
    return ValidationChecker.checkFormInputIsValid(this.signInForm, element);
  }
}
