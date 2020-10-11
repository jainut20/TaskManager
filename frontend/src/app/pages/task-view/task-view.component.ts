import { Component, OnInit } from '@angular/core';
import { TaskService } from 'src/app/task.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Task } from 'src/app/models/taskmodel';
import { List } from 'src/app/models/listmodel';

@Component({
  selector: 'app-task-view',
  templateUrl: './task-view.component.html',
  styleUrls: ['./task-view.component.scss']
})
export class TaskViewComponent implements OnInit {
  title: string

  Lists: List[]
  Tasks: Task[]
  SelectedListid:string
  constructor(private route: ActivatedRoute, private taskService: TaskService,private router:Router) { }

  ngOnInit(): void {

    this.route.params.subscribe((params: Params) => {
     
      if (params.listid != undefined) {
        this.SelectedListid=params.listid
        this.taskService.getTasks(params.listid).subscribe((tasks: Task[]) => {
         
          this.Tasks = tasks
        })
      }
    })

    this.getAllList()
  }

  getAllList() {
    this.taskService.getLists().subscribe((list: List[]) => {
    
      this.Lists = list
    })
  }


  OnclickTask(task:Task){
    
    this.taskService.completeTask(task).subscribe((res:any)=>{
      console.log(res)
      task.completed=!(task.completed)
    })
  }


  DeleteList(){
    this.taskService.deleteList(this.SelectedListid).subscribe((res:any)=>{
      console.log(res)
      this.router.navigate(['/lists'])
    })
  }


  DeleteTask(id){
    this.taskService.deleteTask(this.SelectedListid,id).subscribe((res:any)=>{
      console.log(res)
      this.Tasks=this.Tasks.filter(val => val._id != id)
    })
  }

  
  
}
