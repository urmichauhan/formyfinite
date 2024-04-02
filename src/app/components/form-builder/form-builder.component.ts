import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent {
  formFields: any[] = [];
  formMaker: FormGroup;
  controlType: any;
  modalRef: BsModalRef; // Modal reference
  controlTypes: any = [];

  @ViewChild('controlConfigModal') controlConfigModal: TemplateRef<any>; // Reference to control configuration modal

  constructor(private fb: FormBuilder, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.formMaker = this.fb.group({
      arrayForm : this.fb.array([])
    });
    this.controlTypes = [
      { id: 1,  iconClass: "fas fa-font", showAdd: false, fieldName: "Text", controlName : "text" },
      { id: 2,  iconClass: "fas fa-text-height", showAdd: false, fieldName: "Textarea", controlName : "textarea" },
      { id: 3,  iconClass: "fas fa-list", showAdd: false, fieldName: "Radio", controlName : "radio" },
      { id: 4,  iconClass: "fas fa-check-square", showAdd: false, fieldName: "Checkbox", controlName : "checkbox" },
      { id: 5,  iconClass: "fas fa-caret-down", showAdd: false, fieldName: "Dropdown", controlName : "dropdown" },
      { id: 6,  iconClass: "far fa-calendar-alt", showAdd: false, fieldName: "Date", controlName : "date" },
      { id: 7,  iconClass: "fas fa-file-upload", showAdd: false, fieldName: "File", controlName : "file" },
      { id: 8,  iconClass: "fas fa-sort-numeric-up", showAdd: false, fieldName: "Number", controlName : "number" },
      { id: 9,  iconClass: "far fa-envelope", showAdd: false, fieldName: "Email", controlName : "email" },
      { id: 10, iconClass: "fas fa-lock", showAdd: false, fieldName: "Password", controlName : "password" },
      // { id: 11, iconClass: "fas fa-phone", showAdd: false, fieldName: "Phone" },
      // { id: 12, iconClass: "fas fa-map-marker-alt", showAdd: false, fieldName: "Address" }
    ]
  }

  // Formarray
  get arrayForm() {
    return this.formMaker.get("arrayForm") as FormArray;
  }

  openControlConfig(type:any) {
    this.controlType = type;
    this.addControl(this.controlType);
  }

  addControl(type) {
    // if(type.id == 1){
      this.arrayForm.push(this.fb.group({
        type : this.fb.control(type.fieldName),
        typeId : this.fb.control(type.controlName+(this.arrayForm.length+1)),
        title : this.fb.control(""),
        maxWidth : this.fb.control(""),
        minWidth : this.fb.control(""),
        options : this.fb.control(""),
        pattern : this.fb.control(""),

      }));
    // } 
    console.log(this.arrayForm);
  }
}
