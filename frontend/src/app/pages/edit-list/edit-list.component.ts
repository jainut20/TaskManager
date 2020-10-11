import { Component, OnInit } from '@angular/core';
import { Router, Route, ActivatedRoute, Params } from '@angular/router';
import { TaskService } from 'src/app/task.service';

@Component({
  selector: 'app-edit-list',
  templateUrl: './edit-list.component.html',
  styleUrls: ['./edit-list.component.scss']
})
export class EditListComponent implements OnInit {

  constructor(private route: ActivatedRoute,private taskService:TaskService,private router:Router) { }
  title
  listid
  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      if (params.listid != undefined) {
        this.listid = params.listid

      }
    })
  }


  EditList() {
    this.taskService.updateList(this.listid,this.title).subscribe((res:any)=>{
      console.log(res)
      this.router.navigate(['/lists',this.listid])
    })
  }
}
