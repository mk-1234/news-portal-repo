import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  //apiUrl = 'http://localhost:8080/api';
  apiUrl = environment.API_URL + '/api';

  constructor(private http: HttpClient) { }

  // --- ARTICLES ---

  getAllArticles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/articles`);
  }

  addArticle(article: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/articles`, article);
  }

  editArticle(article: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/articles`, article);
  }

  getArticle(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/articles/${id}`);
  }

  deleteArticle(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/articles/${id}`);
  }

  getArticlesByCategory(category: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/articles/category/${category}`);
  }

  getArticlesbyCategoryAndLimit(category: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/articles/category/limit/${category}`);
  }

  getArticlesByAuthor(authorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/articles/author/${authorId}`);
  }

  // --- COMMENTS ---

  getAllComments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/comments`);
  }

  getComment(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/comments/${id}`);
  }

  getCommentsByArticle(articleId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/comments/article/${articleId}`);
  }

  getCommentsByUser(userId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/comments/user/${userId}`);
  }

  addComment(comment: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/comments`, comment);
  }

  editComment(comment: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/comments`, comment);
  }

  deleteComment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/comments/${id}`);
  }

}
