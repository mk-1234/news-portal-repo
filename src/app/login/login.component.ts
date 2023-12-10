import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  loginForm = new FormGroup({
    'username' : new FormControl('', Validators.required),
    'password' : new FormControl('', Validators.required)
  });

  errorMsg: string = '';

  constructor(private auth: AuthService, private app: AppComponent, private router: Router) { }

  onLogin() {
    this.auth.login(this.loginForm.value).subscribe(res => {
      console.log('res:', res);
      console.log('login res message:', res.message);
      this.errorMsg = res.message;
      if (res.success) {
        console.log('logged in');
        if (res.result) {
          console.log('res result:', res.result);
          this.app.user = res.result;
          this.app.loggedIn = true;
        }
        if (res.token) {
          console.log('token:', res.token);
          sessionStorage.removeItem('token');
          sessionStorage.setItem('token', res.token);
        }
        let articleId = this.app.getLoginFromArticle();
        console.log('articleId in login:', articleId);
        this.app.setLoginFromArticle(-1);
        if (articleId < 0) {
          this.router.navigate(['/']);
        } else {
          this.router.navigate([articleId]);
        }
      } else {
        console.log('login failed');
      }
    }, err => {
      console.log('error in login:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });
  }

  setClass() {
    if (this.loginForm.valid) {
      //return {'color': 'darkgreen', 'background-color': 'rgba(250, 235, 215, 0.5)'};
      //return {'color': 'darkgreen', 'background-color': 'white'};
      return {'color': 'white', 'background-color': 'rgba(0, 80, 0, 0.4)'};
    } else {
      //return {'color': 'rgba(100, 100, 100, 0.7)'};
      return {'color': 'rgba(64, 80, 100, 0.4)'};
    }
  }

}
