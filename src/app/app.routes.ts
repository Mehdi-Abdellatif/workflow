import { Routes } from '@angular/router';
import { BpmnEditorComponent } from './components/bpmn-editor/bpmn-editor.component';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: AppComponent }, // Default route (optional: replace with a homepage)
  { path: 'bpmn-editor', component: BpmnEditorComponent }, // BPMN Editor page
  { path: '**', redirectTo: '' } // Redirect unknown routes to home
];
