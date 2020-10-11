import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from 'src/app/models/taskmodel';

@Component({
  selector: 'app-new-tasks',
  templateUrl: './new-tasks.component.html',
  styleUrls: ['./new-tasks.component.scss']
})
export class NewTasksComponent implements OnInit {
  title
  listid
  constructor(private taskService:TaskService, private route:ActivatedRoute,private router:Router) { }

  ngOnInit(): void {

    this.route.params.subscribe((params: Params) => {
      this.listid=params.listid
     
    })
  }


  createTask(){
      this.taskService.createTask(this.title,this.listid).subscribe((res:Task)=>{
        console.log(res)
        this.router.navigate(['../'] , {relativeTo:this.route})
      })
  }
}
