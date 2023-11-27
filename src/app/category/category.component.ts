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
    });
    if (this.app.getUser()) {
      this.loggedIn = this.app.loggedIn;
      this.mayWrite = this.app.getUser().level < 2 ? true : false;
    }
  }

  refreshArticles(): void {
    this.api.getArticlesByCategory(this.route.snapshot.params['category']).subscribe(res => {
      if (res.data.length > 0) {
        this.articles = res.data;
      }
    });
  }

  writeArticle(): void {
    this.app.writeCategory = this.category;
    //console.log('category:', this.category, '- from app:', this.app.writeCategory);
    this.router.navigate(['../../-1']);
  }

  transformDate(date: string): string {
    return this.app.transformDate(date);
  }

  setImageStyle(img: string): any {
    return {
      'background-image': `url(../../assets/${img})`
    };
  }

}
