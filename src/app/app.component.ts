import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'NewsPortal';

  user: any;
  loggedIn: boolean = false;
  mayWrite: boolean = false;
  authenticated: boolean = false;

  writeCategory: string = '';
  loginFromArticle: number = -1;

  constructor(private auth: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.auth.getUserInformation().subscribe(res => {
      if (res.success) {
        this.user = res.user;
        this.loggedIn = true;
      } else {
        this.logout();
      }
    }, (err) => {
      console.log(' --- ERROR ---\n', err);
      this.logout();
    });
  }

  getUser(): any {
    return this.user;
  }

  getLoginFromArticle(): number {
    return this.loginFromArticle;
  }

  setLoginFromArticle(articleId: number): void {
    this.loginFromArticle = articleId;
  }

  logout(): void {
    this.user = null;
    this.loggedIn = false;
    this.authenticated = false;
    sessionStorage.removeItem('token');
    this.refreshPage('/');
  }

  refreshPage(path: string): void {
    this.router.navigateByUrl('/signup', { skipLocationChange: true }).then(() => {
      this.router.navigate([path]);
    });
  }

  goToProfile(): void {
    this.refreshPage(`profile/${this.user.id}`);
  }

  transformDate(date: string): string {
    let year = date.slice(0, 4);
    let month = date.slice(5, 7);
    let day = date.slice(8, 10);
    let hour = date.slice(11, 13);
    let minute = date.slice(14);
    return `${day}/${month}/${year} | ${hour}:${minute}`;
  }

}
