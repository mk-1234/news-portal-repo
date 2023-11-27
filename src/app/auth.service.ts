import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  //authUrl = 'http://localhost:8080/authenticate';
  //apiUrl = 'http://localhost:8080/api';
  authUrl = environment.API_URL + '/authenticate';
  apiUrl = environment.API_URL + '/api';

  constructor(private http: HttpClient) { }

  // --- USERS ---

  addUser(user: any): Observable<any> {
    return this.http.post(`${this.authUrl}/signup`, user);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.authUrl}/login`, credentials);
  }

  getUserInformation(): Observable<any> {
    return this.http.get(`${this.apiUrl}/me`);
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/users`);
  }

  editUser(user: any): Observable<any> {
    return this.http.put(`${this.authUrl}/users`, user);
  }

  getUser(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/users/${id}`);
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

}
