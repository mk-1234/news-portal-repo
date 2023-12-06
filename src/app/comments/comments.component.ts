import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AppComponent } from '../app.component';
import { ApiService } from '../api.service';
import { formatDate } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit, OnChanges {

  @Input() articleId: number = -1;
  @Input() user: any;
  @Input() inProfile: boolean = false;

  comments: any;
  newComment: any;
  writingComment: boolean = false;
  editingComment: boolean = false;
  userLoggedIn: boolean = false;
  //user: any;

  editIndex: number = -1;
  commentText: string = '';
  articleIdHelp: number = -1;
  userIdHelp: number = -1;
  mayEdit: boolean = false;

  constructor(private api: ApiService, private app: AppComponent, private route: ActivatedRoute) { }

  ngOnInit(): void {
    if (this.inProfile) {
      let userId = this.route.snapshot.params['id'];
      console.log('profile user id:', userId);
      console.log('user:', this.user);
      this.api.getCommentsByUser(userId).subscribe(res => {
        console.log('get all comments by user res:', res);
        console.log('res message:', res.message);
        if (res.success) {
          this.comments = res.data;
        }
      }, err => {
        console.log('error in get comments by user:', err);
        console.log('error message:', err.error.message);
        this.app.logout();
      });
    } else {
      console.log('article id:', this.articleId);
      console.log('user:', this.user);
      this.api.getCommentsByArticle(this.articleId).subscribe(res => {
        console.log('get all comments by article res:', res);
        console.log('res message:', res.message);
        if (res.success) {
          this.comments = res.data;
        }
      }, err => {
        console.log('error in get comments by article:', err);
        console.log('error message:', err.error.message);
        this.app.logout();
      });
    }
    //this.user['id'] = 1;
    /*this.articleId.subscribe(() => {
      //this.category = params['category'];
      console.log('input article id:', this.articleId);
      this.refreshComments();
    });*/

    //this.user = this.app.getUser();
    //this.refreshComments();

    /*this.api.getCommentsByArticle(this.articleId).subscribe(res => {
      console.log('get all comments res:', res);
      console.log('res message:', res.message);
      if (res.success) {
        this.comments = res.data;
      }
    });*/
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes:', changes);
    if (changes['user'].currentValue) {
      let u = changes['user'].currentValue;
      if (u && u.id) {
        this.userLoggedIn = true;
        if (u.level == 0) {
          this.mayEdit = true;
        }
      }
    } else {
      this.userLoggedIn = false;
    }
  }

  /*refreshComments(): void {
    console.log('article id:', this.articleId);
    console.log('user:', this.user);
    this.api.getCommentsByArticle(this.articleId).subscribe(res => {
      console.log('get all comments res:', res);
      console.log('res message:', res.message);
      if (res.success) {
        this.comments = res.data;
      }
    });
  }*/

  addComment() {
    let c = {
      articleId: this.articleId,
      userId: this.user.id,
      comment: this.commentText,
      createdDate: this.getDate()
    };
    this.api.addComment(c).subscribe(res => {
      console.log('add comment res:', res);
      console.log('message:', res.message);
      if (res.success) {
        console.log('added comment id:', res.id);
        //this.router.navigate(['../', res.id]);
        this.app.refreshPage(`../${this.articleId}`);
      }
    }, err => {
      console.log('error in add comment:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });
    this.endWriting();
  }

  endWriting() {
    this.writingComment = false;
    this.commentText = '';
  }

  startEdit(id: number) {
    this.editIndex = id;
    this.editingComment = true;
    for (let c in this.comments) {
      if (this.comments[c].id == id) {
        this.commentText = this.comments[c].comment;
        this.articleIdHelp = this.comments[c].articleId;
      }
    }
  }

  doneEdit(id: number, articleId: number, userId: number, createdDate: string) {
    let c = {
      id: id,
      articleId: articleId,
      userId: userId,
      comment: this.commentText,
      createdDate: createdDate
    };
    if (this.inProfile) {
      c.comment += this.modifyComment(this.app.getUser(), userId);
    } else {
      c.comment += this.modifyComment(this.user, userId);
    }
    this.cancelEdit();
    this.api.editComment(c).subscribe(res => {
      console.log('edit comment res:', res);
      console.log('message:', res.message);
      if (res.success) {
        console.log('affected comments:', res.affected);
        if (!this.inProfile) {
          this.app.refreshPage(`../${this.articleId}`);
        } else {
          this.app.refreshPage(`../profile/${this.user.id}`);
        }
      } else {
        console.log('update comment fail message:', res.message);
      }
    }, err => {
      console.log('error in edit comment:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });
  }

  modifyComment(u: any, id: number): string {
    if (!u) return '';
    if (u.id == id) return ' --- (edited)';
    else return u.level == 0 ? ' --- (edited by admin)' : '';
  }

  delete(id: number) {
    this.api.deleteComment(id).subscribe(res => {
      if (res.success) {
        console.log('delete comment success message:', res.message);
        if (!this.inProfile) {
          this.app.refreshPage(`../${this.articleId}`);
        } else {
          this.app.refreshPage(`../profile/${this.user.id}`);
        }
      } else {
        console.log('delete comment fail message:', res.message);
      }
    }, err => {
      console.log('error in delete comment:', err);
      console.log('error message:', err.error.message);
      this.app.logout();
    });
  }

  cancelEdit() {
    this.commentText = '';
    this.editIndex = -1;
    this.editingComment = false;
  }

  getDate(): string {
    return formatDate(new Date(), 'yyyy-MM-dd-HH-mm', 'en-US');
  }

  transformDate(date: string): string {
    return this.app.transformDate(date);
  }

  setClass() {
    if (this.commentText != '') {
      return {'color': 'green', 'background-color': 'rgba(250, 235, 215, 0.5)'};
    } else {
      return {'color': 'rgba(100, 100, 100, 0.7)'};
    }
  }

  setBorder(index: number): any {
    if (index == 0) {
      return {
        /*'color': 'blue',*/
        /*'border': 'none',
        'border-top': '2px solid rgba()',
        'border-radius': '15px 15px 0px 0px',*/
        //'border-bottom': 'none'
      };
    } else if (index == this.comments.length - 1) {
      return {
        /*'color': 'green',*/
        //'border-radius': '0px 0px 15px 15px',
        //'border-top': 'none'
      }
    } else {
      return {
        /*'border-top': 'none',
        'border-bottom': 'none'*/
        //'border': 'none'
      }
    }
  }

}
