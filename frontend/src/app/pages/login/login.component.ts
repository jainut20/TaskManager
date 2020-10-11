import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/auth.service';
import { HttpResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  email
  password
  constructor(private auth:AuthService,private router:Router) { }

  ngOnInit(): void {
  }


  Login(){  
    this.auth.login(this.email,this.password).subscribe((res:HttpResponse<any>)=>{
        if(res.status ===200){
          this.router.navigateByUrl('/lists')
        }
        else{
         alert('Wrong email or password')
        }
    })
  }

  Signup(){
    this.router.navigate(['/signup'])
  }
}
