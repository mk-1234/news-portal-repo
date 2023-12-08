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
    console.log('snapshot:', this.route.snapshot);
    console.log('param articledetail from snapshot:', this.route.snapshot.params['articleDetail']);
    this.route.params.subscribe((params: Params) => {
      this.paramId = params['articleDetail'];
      console.log('article id param:', this.paramId);
      this.refreshArticle();
      this.checkUser();
    });
    this.interval = setInterval(() => {
      console.log('checking user...');
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
      console.log('user:', this.user, '- app user:', this.app.getUser());
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
      console.log('category on refresh:', this.app.writeCategory);
      this.articleForm.controls['category'].setValue(
        this.app.writeCategory ? this.app.writeCategory : 'Domestic'
      );
      this.fetchImageNames();
    } else {
      this.api.getArticle(this.paramId).subscribe(res => {
        console.log('res:', res);
        console.log('res message', res.message);
        this.writingArticle = false;
        this.editingArticle = false;
        if (res.success) {
          this.article = res.data[0];
        }
      }, err => {
        console.log('error in get article:', err);
        console.log('error message:', err.error.message);
        this.app.logout();
      });
    }
  }

  fetchImageNames(): void {
    this.api.getImageNames().subscribe(res => {
      console.log('res:', res);
      console.log('res message:', res.message);
      if (res.success) {
        this.imageNames = res.data;
      }
    }, err => {
      console.log('error in get image names:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });
  }

  submitArticle() {
    console.log('article form val:', this.articleForm.value);
    if (this.editingArticle) {
      let a = this.populateArticleFields(ArticleAction.EDIT);
      console.log('article after populate edit:', a);
      this.api.editArticle(a).subscribe(res => {
        console.log('edit article res:', res);
        console.log('message:', res.message);
        this.writingArticle = false;
        this.editingArticle = false;
        if (res.success) {
          console.log('affected articles:', res.affected);
          a['username'] = this.article.username;
          this.article = a;
          console.log('---- after edit ----\na:', a);
          console.log('article:', this.article, '\n----------');
          this.editingArticle = false;
          this.writingArticle = false;
        }
      }, err => {
        console.log('error in edit article:', err);
        console.log('error message:', err.error.message);
        this.app.logout();
      });
    } else {
      let a = this.populateArticleFields(ArticleAction.WRITE);
      console.log('article after populate write:', a);
      this.api.addArticle(a).subscribe(res => {
        console.log('add article res:', res);
        console.log('message:', res.message);
        this.writingArticle = false;
        this.editingArticle = false;
        if (res.success) {
          console.log('added article id:', res.id);
          this.editingArticle = false;
          this.writingArticle = false;
          //this.router.navigate(['../', res.id]);
          this.app.refreshPage(`../${res.id}`);
        }
      }, err => {
        console.log('error in add article:', err);
        console.log('error message:', err.error.message);
        this.app.logout();
      });
    }
  }

  populateArticleFields(action: ArticleAction): any {
    console.log('action:', action);
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
    //this.articleForm.controls['image'].setValue('');
    this.articleForm.controls['image'].setValue(this.article.image);
    this.articleForm.controls['summary'].setValue(this.article.summary);
    this.articleForm.controls['article'].setValue(this.article.article);
    this.editingArticle = true;
    this.writingArticle = true;
    console.log('image value:', this.article.image);
    this.fetchImageNames();
  }

  cancelEdit() {
    console.log('text before cancel:', this.articleForm.value.article);
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
        console.log('delete success message:', res.message);
        this.router.navigate(['../']);
      } else {
        console.log('delete fail message:', res.message);
      }
    }, err => {
      console.log('error in delete article:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });
  }

  textHighlight(ev: any) {
    console.log('in text select!,', ev);
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
    console.log('start:', textBeforeStartIndex, '\nmiddle:', textMiddle, '\nend:', textAfterEndIndex);
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
      //if (this.articleForm.value.image) {
        return {
          'background-image': `url(../../assets/${this.articleForm.value.image}.png)`
        };
      /*} else {
        return;
      }*/
    }
  }

}
