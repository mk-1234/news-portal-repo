import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {

  signupForm = new FormGroup({
    'username' : new FormControl('', [Validators.required, Validators.minLength(3)]),
    'password' : new FormControl('', Validators.required),
    'repeat-password' : new FormControl('', Validators.required),
    'first-name' : new FormControl('', Validators.required),
    'last-name' : new FormControl('', Validators.required),
    'email' : new FormControl('', [Validators.required, Validators.email]),
  });

  wrongPass : boolean = false;
  errorMsg: string = '';

  constructor(private auth: AuthService, private app: AppComponent) { }

  ngOnInit(): void {
    
  }

  onSignup() {
    if(this.signupForm.value['password'] != this.signupForm.value['repeat-password']) {
      this.wrongPass = true;
    } else {
      this.wrongPass = false;

      if (this.signupForm.valid) {
        let newUser = {
          username: this.signupForm.value['username'],
          password: this.signupForm.value['password'],
          firstName: this.signupForm.value['first-name'],
          lastName: this.signupForm.value['last-name'],
          email: this.signupForm.value['email'],
          level: 2
        };
        this.auth.addUser(newUser).subscribe(res => {
          this.errorMsg = res.message;
          if (res.success) {
            this.app.refreshPage('login');
          } else {
            console.log('user not added');
          }
        }, err => {
          console.log('error in add user:', err);
          this.app.logout();
        });
      }
    }
  }

  setClass() {
    if (this.signupForm.valid) {
      return {'color': 'green', 'background-color': 'rgba(250, 235, 215, 0.5)'};
    } else {
      return {'color': 'rgba(100, 100, 100, 0.7)'};
    }
  }

}
