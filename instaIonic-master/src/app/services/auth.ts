import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
@Injectable({
  providedIn: 'root',
})
export class Auth {

  private tokenKey = 'token';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    return this.http.post<{user:any, token:string}>(this.apiUrl + 'login', { email, password });
  }

  register(data: {name:string; email:string; password:string; username:string}) {
    return this.http.post<{user:any, token:string}>(this.apiUrl +  'register', data);
  }

  setToken(token: string) { localStorage.setItem(this.tokenKey, token); }
  
  getToken(): string | null { return localStorage.getItem(this.tokenKey); }
  
  setUser(user: any) { localStorage.setItem('user', JSON.stringify(user)); }
  
  getUser(): any { 
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }
  
  logout() { 
    localStorage.removeItem(this.tokenKey); 
    localStorage.removeItem('user');
  }

  logoutRemote() {
    const token = this.getToken();
    if (!token) { this.logout(); return; }
    return this.http.post(
      this.apiUrl + 'logout',
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  }

}
