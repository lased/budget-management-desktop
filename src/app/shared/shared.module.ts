import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DialogService } from 'primeng/api';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { MessageModule } from 'primeng/message';
import { InputTextModule } from 'primeng/inputtext';
import { DynamicDialogModule } from 'primeng/dynamicdialog';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ListboxModule } from 'primeng/listbox';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { InputMaskModule } from 'primeng/inputmask';
import { TableModule } from 'primeng/table';
import { AccordionModule } from 'primeng/accordion';
import { ChartModule } from 'primeng/chart';
import { MenubarModule } from 'primeng/menubar';

import { InputComponent } from './components/input/input.component';
import { LoaderComponent } from './components/loader/loader.component';
import { QrScannerComponent } from './components/qr-scanner/qr-scanner.component';
import { FnsComponent } from './components/fns/fns.component';
import { EmptyListComponent } from './components/empty-list/empty-list.component';
import { TableComponent } from './components/table/table.component';

const Common = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule
];

const UIComponents = [
  ToolbarModule,
  ButtonModule,
  TabMenuModule,
  DynamicDialogModule,
  MessageModule,
  InputTextModule,
  SelectButtonModule,
  ListboxModule,
  DropdownModule,
  CalendarModule,
  InputTextareaModule,
  ToastModule,
  InputMaskModule,
  TableModule,
  AccordionModule,
  ChartModule,
  MenubarModule
];

const Components = [
  InputComponent,
  LoaderComponent,
  QrScannerComponent,
  FnsComponent,
  EmptyListComponent,
  TableComponent
];

@NgModule({
  declarations: [...Components],
  imports: [
    ...Common,
    ...UIComponents
  ],
  exports: [
    ...Common,
    ...UIComponents,
    ...Components
  ],
  providers: [DialogService]
})
export class SharedModule { }
