import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContractPageComponent } from './pages/contract-page/contract-page.component';
import { IndexPageComponent } from './pages/index-page/index-page.component';

const routes: Routes = [
  { path: '', component: IndexPageComponent },
  { path: 'contract/:id', component: ContractPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
