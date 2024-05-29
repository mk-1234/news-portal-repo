import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {

  category: string = '';
  articles: any;
  
  loggedIn: boolean = false;
  mayWrite: boolean = false;

  interval: any;

  constructor(
    private api: ApiService, 
    private route: ActivatedRoute, 
    private router: Router, 
    private app: AppComponent
  ) { }

  ngOnInit(): void {
    console.log('category param:', this.route.snapshot.params['category']);
    this.route.params.subscribe((params: Params) => {
      this.category = params['category'];
      console.log('category param:', this.route.snapshot.params['category']);
      this.refreshArticles();
      this.checkUser();
    });
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
      console.log('could not get user from category');
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshArticles(): void {
    this.api.getArticlesByCategory(this.route.snapshot.params['category']).subscribe(res => {
      console.log('get articles by category res:', res);
      if (res.data.length > 0) {
        this.articles = res.data;
      }
    }, err => {
      console.log('error in get articles by category:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });
  }

  writeArticle(): void {
    this.app.writeCategory = this.category;
    this.router.navigate(['../../-1']);
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
