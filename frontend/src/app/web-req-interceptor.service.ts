import { Injectable } from '@angular/core';
import { HttpResponse, HttpHandler, HttpRequest, HttpErrorResponse, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError, empty, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebReqInterceptorService implements HttpInterceptor {

  constructor(private auth:AuthService) { }
  RefreshingAcessToken:boolean

  accessTokenRefreshed:Subject<any>=new Subject();
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request)

    //call next() and handle response
    console.log(request)
    return next.handle(request).pipe(
      catchError((err:HttpErrorResponse)=>{
        alert('Something went wrong. Please Try again.')
        console.log(err)

        if(err.status == 401){

          return this.refreshAccessToken().pipe(
            switchMap(() => {
              request = this.addAuthHeader(request)
              return next.handle(request)
            }),
            catchError((err)=>{
              console.log(err)
              this.auth.logout()
              return empty()
            })
          )
  
        }
        return throwError(err)
      })
    )
  }


  refreshAccessToken(){
    if(this.RefreshingAcessToken){
      return new Observable(observer=>{
        this.accessTokenRefreshed.subscribe(()=>{
          //this will run whem access token has been refreshed
          observer.next();
          observer.complete()
        })
      })
    }
    else{
      this.RefreshingAcessToken=true
       return this.auth.getNewAccessToken().pipe(
         tap(()=>{
           this.RefreshingAcessToken=false
           console.log("Access TOken Refreshed")
           this.accessTokenRefreshed.next()
         })
       )

    }
  }

  addAuthHeader(request:HttpRequest<any>) { 
    //get access token
    const token=this.auth.getAccessToken()
    if(token){
      return request.clone({
        setHeaders:{
          'x-access-Token':token
        }
      })
    }

    return request
  }
}
