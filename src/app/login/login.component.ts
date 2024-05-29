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
      this.errorMsg = res.message;
      if (res.success) {
        if (res.result) {
          this.app.user = res.result;
          this.app.loggedIn = true;
        }
        if (res.token) {
          sessionStorage.removeItem('token');
          sessionStorage.setItem('token', res.token);
        }
        let articleId = this.app.getLoginFromArticle();
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
      this.app.logout();
    });
  }

  setClass() {
    if (this.loginForm.valid) {
      return {'color': 'white', 'background-color': 'rgba(0, 80, 0, 0.4)'};
    } else {
      return {'color': 'rgba(64, 80, 100, 0.4)'};
    }
  }

}
