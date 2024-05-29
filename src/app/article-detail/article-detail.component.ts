import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { formatDate } from '@angular/common';
import { AppComponent } from '../app.component';


enum ArticleAction {
  WRITE, EDIT
}

@Component({
  selector: 'app-article-detail',
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.css']
})
export class ArticleDetailComponent implements OnInit {

  articleForm = new FormGroup({
    'title' : new FormControl('', Validators.required),
    'category' : new FormControl(''),
    'image' : new FormControl(''),
    'summary' : new FormControl('', Validators.required),
    'article' : new FormControl('', Validators.required)
  });

  paramId: number = 0;
  article: any;
  imageNames: any;

  user: any;
  writerLoggedIn: boolean = false;
  mayWrite: boolean = false;
  editingArticle: boolean = false;
  writingArticle: boolean = false;
  startIndex: number = -1;
  endIndex: number = -1;
  
  interval: any;

  constructor(
    private api: ApiService, 
    private route: ActivatedRoute, 
    private router: Router, 
    private app: AppComponent
  ) { }

  ngOnInit(): void {
    this.paramId = this.route.snapshot.params['articleDetail'];
    this.route.params.subscribe((params: Params) => {
      this.paramId = params['articleDetail'];
      this.refreshArticle();
      this.checkUser();
    });
    this.interval = setInterval(() => {
      if (!sessionStorage.getItem('token')) {
        console.log('no token, clearing interval');
        clearInterval(this.interval);
      }
      this.checkUser();
      if (this.user) {
        console.log('clearing interval, user found');
        clearInterval(this.interval);
      }
    }, 200);
  }

  checkUser(): void {
    if (this.app.getUser()) {
      this.user = this.app.getUser();
      if (this.article) {
        this.writerLoggedIn = this.user.id == this.article.authorId ? true : false;
      }
      this.mayWrite = this.app.getUser().level < 2 ? true : false;
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  refreshArticle(): void {
    if (this.paramId == -1) {
      this.editingArticle = false;
      this.writingArticle = true;
      this.articleForm.controls['category'].setValue(
        this.app.writeCategory ? this.app.writeCategory : 'Domestic'
      );
      this.fetchImageNames();
    } else {
      this.api.getArticle(this.paramId).subscribe(res => {
        this.writingArticle = false;
        this.editingArticle = false;
        if (res.success) {
          this.article = res.data[0];
        }
      }, err => {
        console.log('error in get article:', err);
        this.app.logout();
      });
    }
  }

  fetchImageNames(): void {
    this.api.getImageNames().subscribe(res => {
      if (res.success) {
        this.imageNames = res.data;
      }
    }, err => {
      console.log('error in get image names:', err);
      this.app.logout();
    });
  }

  submitArticle() {
    if (this.editingArticle) {
      let a = this.populateArticleFields(ArticleAction.EDIT);
      this.api.editArticle(a).subscribe(res => {
        this.writingArticle = false;
        this.editingArticle = false;
        if (res.success) {
          a['username'] = this.article.username;
          this.article = a;
        }
      }, err => {
        console.log('error in edit article:', err);
        this.app.logout();
      });
    } else {
      let a = this.populateArticleFields(ArticleAction.WRITE);
      this.api.addArticle(a).subscribe(res => {
        this.writingArticle = false;
        this.editingArticle = false;
        if (res.success) {
          this.app.refreshPage(`../${res.id}`);
        }
      }, err => {
        console.log('error in add article:', err);
        this.app.logout();
      });
    }
  }

  populateArticleFields(action: ArticleAction): any {
    if (action == ArticleAction.WRITE) {
      return {
        authorId: this.user.id,
        title: this.articleForm.value.title,
        category: this.articleForm.value.category,
        summary: this.articleForm.value.summary,
        article: this.articleForm.value.article,
        image: this.articleForm.value.image ? this.articleForm.value.image : 'city_01',
        createdDate: this.getDate()
      };
    } else if (action == ArticleAction.EDIT) {
      return {
        id: this.article.id,
        authorId: this.article.authorId ? this.article.authorId : 1,
        title: this.articleForm.value.title,
        category: this.articleForm.value.category,
        summary: this.articleForm.value.summary,
        article: this.articleForm.value.article,
        image: this.articleForm.value.image ? this.articleForm.value.image : 'city_01',
        createdDate: this.article.createdDate ? this.article.createdDate : this.getDate()
      };
    }
  }

  getDate(): string {
    return formatDate(new Date(), 'yyyy-MM-dd-HH-mm', 'en-US');
  }

  startEdit() {
    this.articleForm.controls['title'].setValue(this.article.title);
    this.articleForm.controls['category'].setValue(this.article.category);
    this.articleForm.controls['image'].setValue(this.article.image);
    this.articleForm.controls['summary'].setValue(this.article.summary);
    this.articleForm.controls['article'].setValue(this.article.article);
    this.editingArticle = true;
    this.writingArticle = true;
    this.fetchImageNames();
  }

  cancelEdit() {
    if (this.editingArticle) {
      this.editingArticle = false;
      this.writingArticle = false;
    } else {
      this.router.navigate(['../']);
    }
  }

  deleteArticle(id: number): void {
    this.api.deleteArticle(id).subscribe(res => {
      if (res.success) {
        this.router.navigate(['../']);
      } else {
        console.log('delete fail message:', res.message);
      }
    }, err => {
      console.log('error in delete article:', err);
      this.app.logout();
    });
  }

  textHighlight(ev: any) {
    this.startIndex = ev.target.selectionStart;
    this.endIndex = ev.target.selectionEnd;
    console.log(ev.target.value.substr(this.startIndex, this.endIndex - this.startIndex));
  }

  applyFormat(elType: string): void {
    if (this.startIndex < 0 || this.endIndex < 0) return;
    let currentText = this.articleForm.value.article;
    let textBeforeStartIndex = currentText?.substring(0, this.startIndex);
    let textMiddle = '';
    if (elType == 'br' || elType == 'hr') {
      textMiddle = `<${elType} />` + currentText?.substring(this.startIndex, this.endIndex);
    } else {
      textMiddle = `<${elType}>` + currentText?.substring(this.startIndex, this.endIndex) + `</${elType}>`;
    }
    let textAfterEndIndex = currentText?.substring(this.endIndex);
    this.articleForm.controls['article'].setValue(textBeforeStartIndex + textMiddle + textAfterEndIndex);
    this.startIndex = -1;
    this.endIndex = -1;
  }

  transformDate(date: string): string {
    return this.app.transformDate(date);
  }

  setClass() {
    if (this.articleForm.valid) {
      return {'color': 'green', 'background-color': 'rgba(250, 235, 215, 0.5)'};
    } else {
      return {'color': 'rgba(100, 100, 100, 0.7)'};
    }
  }

  setImageStyle(isArticle: boolean): any {
    if (isArticle) {
      return {
        'background-image': `url(../../assets/${this.article.image}.png)`
      };
    } else {
      return {
        'background-image': `url(../../assets/${this.articleForm.value.image}.png)`
      };
    }
  }

}
