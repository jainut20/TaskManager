import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { WebRequestService } from './web-request.service';
import { Router } from '@angular/router';
import {shareReplay,tap} from 'rxjs/operators'
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  ROOT_URL
  constructor(private webRequest:WebRequestService,private router:Router,private http: HttpClient) { 
    this.ROOT_URL = 'http://localhost:3000'
  }

  signup(email:string,password:string){
    return this.webRequest.signup(email,password).pipe(
      shareReplay(),
      tap((res:HttpResponse<any>)=>{
        //this.setSession(res.body._id,res.headers.get('x-access-token'),res.headers.get('x-refresh-token'))
        alert('Signup Successful.Login to Continue.')
        this.router.navigateByUrl('/login')
      })
    )
  }

  login(email:string,password:string){
    return this.webRequest.login(email,password).pipe(
      shareReplay(),
      tap((res:HttpResponse<any>)=>{

        
        this.setSession(res.body._id,res.headers.get('x-access-token'),res.headers.get('x-refresh-token'))
      })
    )
  }

  logout(){
    this.removeSession()
    this.router.navigateByUrl('/login')
  }

  private setSession(userId:string,accessToken:string,refreshToken:string){
    localStorage.setItem('userId',userId)
    localStorage.setItem('x-access-token',accessToken)
    localStorage.setItem('x-refresh-token',refreshToken)

  }

  private removeSession(){
    localStorage.removeItem('userId')
    localStorage.removeItem('x-access-token')
    localStorage.removeItem('x-refresh-token')

  }

  getAccessToken() {
    return localStorage.getItem('x-access-token');
  }

  getRefreshToken() {
    return localStorage.getItem('x-refresh-token');
  }
  setAccessToken(accessToken: string) {
    localStorage.setItem('x-access-token', accessToken)
  } 
  getUserId(){
    return localStorage.getItem('userId');
  }


  getNewAccessToken(){
    return this.http.get(`users/me/access-token`,{
      headers:{'x-refresh-token':this.getRefreshToken(),
                '_id':this.getUserId()
    },
    observe: 'response'
    }).pipe(
      tap((res)=>{
        this.setAccessToken(res.headers.get('x-access-token'))
      })
    
    )
  }
}
