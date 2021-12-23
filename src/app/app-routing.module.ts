import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginFormComponent} from "./components/auth/form/login-form.component";
import {MainPageComponent} from "./pages/main/main-page.component";

const routes: Routes = [
  {path: 'main', component: MainPageComponent},
  {path: '**', component: LoginFormComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
