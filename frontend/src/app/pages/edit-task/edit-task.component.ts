import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-edit-task',
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss']
})
export class EditTaskComponent implements OnInit {
  constructor(private route: ActivatedRoute,private taskService:TaskService,private router:Router) { }
  title
  listid
  taskid
  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params.listid != undefined) {
        this.listid = params.listid
        this.taskid=params.taskid
      }
    })
  }


  EditTask() {
    this.taskService.updateTask(this.listid,this.taskid,this.title).subscribe((res:any)=>{
      
      console.log(res)
      this.router.navigate(['/lists',this.listid])
    })
  }

} 
