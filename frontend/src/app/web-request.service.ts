import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
@Injectable({
  providedIn: 'root'
})
export class WebRequestService {
  readonly ROOT_URL

  constructor(private http: HttpClient) {

    this.ROOT_URL = 'http://localhost:3000'
  }


  get(uri: String) {
    return this.http.get(`${uri}`)
  }

  post(uri: String, payload: Object) {
    return this.http.post(`${uri}`, payload)
  }

  patch(uri: String, payload: Object) {
    return this.http.patch(`${uri}`, payload)
  }

  delete(uri: String) {
    return this.http.delete(`${uri}`)
  }


  login(email, password) {
    return this.http.post(`users/login`, { email, password }, { observe: 'response' })
  }

  signup(email, password) {
    return this.http.post(`users`, { email, password }, { observe: 'response' })
  }
}
