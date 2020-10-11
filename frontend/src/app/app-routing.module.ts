import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TaskViewComponent } from './pages/task-view/task-view.component';
import { NewListComponent } from './pages/new-list/new-list.component';
import { NewTasksComponent } from './pages/new-tasks/new-tasks.component';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './signup/signup.component';
import { EditListComponent } from './pages/edit-list/edit-list.component';
import { EditTaskComponent } from './pages/edit-task/edit-task.component';


const routes: Routes = [
  {path:'' , redirectTo:'login', pathMatch:'full' },
  {path:'login' , component:LoginComponent },
  {path:'signup' , component:SignupComponent },
  {path:'newlist' , component:NewListComponent },
  {path:'editlist/:listid' , component:EditListComponent },
  {path:'lists/:listid/edittask/:taskid' , component:EditTaskComponent },
  {path:'lists/:listid' , component:TaskViewComponent },
  {path:'lists' , component:TaskViewComponent },
  {path:'lists/:listid/newtask' , component:NewTasksComponent }




];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
