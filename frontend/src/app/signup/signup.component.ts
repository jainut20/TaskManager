import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  email
  password
  constructor(private auth:AuthService) { }

  ngOnInit(): void {
  }

  Signup(){
    this.auth.signup(this.email,this.password).subscribe((res:HttpResponse<any>)=>{
      console.log(res)
      
    })
  }

}
