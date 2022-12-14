import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { User } from './types';
import { Apollo } from 'apollo-angular';
import { GC_AUTH_TOKEN, GC_USER_ID } from '../constants';
import { LOGIN_USER_QUERY_BY_EMAIL_PASSWORD, GET_CURRENT_USER, REGISTER_USER_QUERY } from './queries'

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _isAuthenticated = new BehaviorSubject(false);
  private _currentUser = new BehaviorSubject({id: "", name: "", email: "", token: ""});

  constructor(private router: Router, private apollo: Apollo) {}

  get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  get currentUser(): Observable<User>{
    return this._currentUser.asObservable();
  }

  tryLogin(email: string, password: string) {
    this.apollo.mutate({
      mutation: LOGIN_USER_QUERY_BY_EMAIL_PASSWORD,
      variables: {
        email: email,
        password: password
      }
    }).subscribe((result: any) => {
      if (result.data.signinUser){
        this.login(result.data.signinUser);
      } else {
        alert("Failed to log in!");
      }
    },(error) => {
      alert(`there was an error logging in. ${error}`);
    });
  }

  logout() {
    localStorage.removeItem(GC_USER_ID);
    localStorage.removeItem(GC_AUTH_TOKEN);
    this._isAuthenticated.next(false);
    this.router.navigate(['/']);
  }

  autoLogin() {
    const local_id = localStorage.getItem(GC_USER_ID);
    const local_token = localStorage.getItem(GC_AUTH_TOKEN);

    if (local_id && local_id.trim().length > 0 && local_token && local_token.trim().length > 0 ){
      this.apollo.watchQuery<any>({
        query: GET_CURRENT_USER,
        variables: {
          local_id: local_id,
          local_token: local_token
        }
      })
        .valueChanges
        .subscribe(({ data, loading }) => {
          if (data.currentUser){
            this.setUser(data.currentUser);
          }
        },(error) => {
          console.log(`there was an error getting current user from server. ${error}`);
        });
    }
  }

  register(name: string, email: string, password: string) {
    this.apollo.mutate({
      mutation: REGISTER_USER_QUERY,
      variables: {
        name: name,
        email: email,
        password: password
      }
    }).subscribe((result: any) => {
      if (result.data.createUser){
        alert("Succeess!");
        this.router.navigate(["/users/login"]);

      } else {
        alert("Failed to register");
      }
    },(error) => {
      alert(`there was an error logging in. ${error}`);
    });
  }

  enforceLoggedIn() {
    if (!this.isAuthenticated){
      this.router.navigate(['/']);
    }
  }

  private login(data: any) {
    localStorage.setItem(GC_USER_ID, data.user.id);
    localStorage.setItem(GC_AUTH_TOKEN, data.user.token);
    this.setUser(data.user);
    this.router.navigate(['/users/profile']);
  }

  private setUser(user: User) {
    const currentUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      token: user.token,
      description: user.description,
      phoneNumber: user.phoneNumber,
      address: user.address,
      socialMediaLinks: user.socialMediaLinks
    };

    this._currentUser.next(currentUser);
    this._isAuthenticated.next(true);
  }
}
