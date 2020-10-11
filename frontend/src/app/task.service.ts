import { Injectable } from '@angular/core';
import { WebRequestService } from './web-request.service';
import { Task } from './models/taskmodel';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(private webRequest:WebRequestService) { }


 
  createList(title:string){
    return this.webRequest.post('lists',{title})
  }
  getLists(){
    return this.webRequest.get('lists')
  }

  updateList(id:string,title:string){
    return this.webRequest.patch(`lists/${id}`,{title})
  }

  deleteList(id:string){
    return this.webRequest.delete(`lists/${id}`)
  }

  createTask(title:string,listId:string){
    return this.webRequest.post(`lists/${listId}/tasks`,{title})
  }

  getTasks(id:any){
    return this.webRequest.get(`lists/${id}/tasks`)
  }

  completeTask(task:Task){
    return this.webRequest.patch(`lists/${task._listId}/tasks/${task._id}`,{completed:!(task.completed)})

  }

  updateTask(id,taskid,title:string){
    return this.webRequest.patch(`lists/${id}/tasks/${taskid}`,{title})
  }

  deleteTask(id,taskid){
    return this.webRequest.delete(`lists/${id}/tasks/${taskid}`)
  }
}
