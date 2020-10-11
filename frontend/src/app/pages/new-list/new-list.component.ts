import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { Router, Route } from '@angular/router';
import { List } from 'src/app/models/listmodel';

@Component({
  selector: 'app-new-list',
  templateUrl: './new-list.component.html',
  styleUrls: ['./new-list.component.scss']
})
export class NewListComponent implements OnInit {
  title
  constructor(private task:TaskService, private router:Router) { }

  ngOnInit(): void {
  }

  createNewList(){
    
    this.task.createList(this.title).subscribe((res:List)=>{
      console.log(res)

      this.router.navigate(['/lists',res._id])
    })


  }
}
