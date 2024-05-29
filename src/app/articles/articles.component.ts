import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { AppComponent } from '../app.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {

  articles: any = new Array(4);
  sideArticles: any = [[], [], [], []];
  bottomArticles: any = [[], [], [], []];
  otherArticles: any = [[], [], [], []];
  mainArticle: any = new Array(4);

  user: any;
  loggedIn: boolean = false;
  mayWrite: boolean = false;
  authenticated: boolean = false;
  
  categories : string[] = ['Domestic', 'International', 'Entertainment', 'Sport'];

  interval: any;

  constructor(private api: ApiService, private app: AppComponent, private router: Router) { }

  ngOnInit(): void {
    this.api.getArticlesbyCategoryAndLimit('Domestic').subscribe(res => {
      if (res.success) {
        this.articles[0] = res.data;
        if (this.articles[0].length > 0) {
          console.log('domestic articles length is > 0');
          this.mainArticle[0] = this.articles[0][0];
          for (let i = 0; i < this.articles[0].length; i++) {
            if (i < 3) {
              this.sideArticles[0].push(this.articles[0][i]);
            } else if (i < 9) {
              this.bottomArticles[0].push(this.articles[0][i]);
            } else if (i < 13) {
              this.otherArticles[0].push(this.articles[0][i]);
            }
          }
        }
      }
    }, err => {
      console.log('error in get articles by category and limit:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });

    this.api.getArticlesbyCategoryAndLimit('International').subscribe(res => {
      if (res.success) {
        this.articles[1] = res.data;
        if (this.articles[1].length > 0) {
          console.log('international articles length is > 0');
          this.mainArticle[1] = this.articles[1][0];
          for (let i = 0; i < this.articles[1].length; i++) {
            if (i < 3) {
              this.sideArticles[1].push(this.articles[1][i]);
            } else if (i < 9) {
              this.bottomArticles[1].push(this.articles[1][i]);
            } else if (i < 13) {
              this.otherArticles[1].push(this.articles[1][i]);
            }
          }
        }
      }
    }, err => {
      console.log('error in get articles by category and limit:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });

    this.api.getArticlesbyCategoryAndLimit('Entertainment').subscribe(res => {
      if (res.success) {
        this.articles[2] = res.data;
        if (this.articles[2].length > 0) {
          console.log('entertainment articles length is > 0');
          this.mainArticle[2] = this.articles[2][0];
          for (let i = 0; i < this.articles[2].length; i++) {
            if (i < 3) {
              this.sideArticles[2].push(this.articles[2][i]);
            } else if (i < 9) {
              this.bottomArticles[2].push(this.articles[2][i]);
            } else if (i < 13) {
              this.otherArticles[2].push(this.articles[2][i]);
            }
          }
        }
      }
    }, err => {
      console.log('error in get articles by category and limit:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });

    this.api.getArticlesbyCategoryAndLimit('Sport').subscribe(res => {
      if (res.success) {
        this.articles[3] = res.data;
        if (this.articles[3].length > 0) {
          console.log('sport articles length is > 0');
          this.mainArticle[3] = this.articles[3][0];
          for (let i = 0; i < this.articles[3].length; i++) {
            if (i < 3) {
              this.sideArticles[3].push(this.articles[3][i]);
            } else if (i < 9) {
              this.bottomArticles[3].push(this.articles[3][i]);
            } else if (i < 13) {
              this.otherArticles[3].push(this.articles[3][i]);
            }
          }
        }
      }
    }, err => {
      console.log('error in get articles by category and limit:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });

    this.checkUser();

    this.interval = setInterval(() => {
      console.log('checking user...');
      if (!sessionStorage.getItem('token')) {
        console.log('no token, clearing interval');
        clearInterval(this.interval);
      }
      this.checkUser();
      if (this.app.getUser()) {
        console.log('clearing interval, user found');
        clearInterval(this.interval);
      }
    }, 200);
  }

  checkUser(): void {
    if (this.app.getUser()) {
      this.loggedIn = this.app.loggedIn;
      this.mayWrite = this.app.getUser().level < 2 ? true : false;
    } else {
      console.log('could not get user from articles');
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  setArticleFocus(id: number, index: number) {
    console.log('focused on', id, 'index', index);
    this.mainArticle[index] = this.articles[index].find((e: any) => {
      if (e.id == id) return e;
    });
    console.log('main article', index, ':', this.mainArticle[index]);
  }

  writeArticle(category: string): void {
    this.app.writeCategory = category;
    this.router.navigate(['-1']);
  }

  transformDate(date: string): string {
    return this.app.transformDate(date);
  }

  setImageStyle(img: string): any {
    return {
      'background-image': `url(../../assets/${img}.png)`
    };
  }

}
