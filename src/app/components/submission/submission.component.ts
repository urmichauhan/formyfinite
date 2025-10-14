import { Component } from '@angular/core';
import { SubmissionService } from './submission.service';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AlertMessages } from 'src/app/app.constant';

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.scss'],
  providers: [SubmissionService]
})
export class SubmissionComponent {
  formPreview: FormGroup;
  userId: string;

  constructor(private fb: FormBuilder, private service: SubmissionService, private route: ActivatedRoute,
    public spinner: NgxSpinnerService, public toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    // Get the user ID from the route
    this.userId = this.route.snapshot.paramMap.get('userId');

    // Initialize form
    this.formPreview = this.fb.group({
      title: [''],
      description: [''],
      arrayForm: this.fb.array([])
    });

    // Load the user-specific form configuration
    this.loadPreview();
  }

  get fieldArray(): FormArray {
    return this.formPreview.get('arrayForm') as FormArray;
  }

  // Fetch and load the preview configuration
  loadPreview() {
    this.spinner.show();
    this.service.getFormConfig(this.userId).subscribe((response: any) => {
      this.spinner.hide();
      if (response) {

        this.formPreview.patchValue({
          title: response.title,
          description: response.description
        });

        if (response.fields.length > 0) {
          response.fields.forEach(field => {
            this.addControlToPreview(field);
          });
        }
      } else {
        this.toastr.error(AlertMessages.SOMETHING_WRONG);
      }
    }, (error) => {
      this.spinner.hide();
      this.toastr.error(AlertMessages.SOMETHING_WRONG);
    });
  }

  // Dynamically add controls to the preview form
  addControlToPreview(field) {
    const fieldArray = this.formPreview.get('arrayForm') as FormArray;
    const controlGroup = this.fb.group({
      title: [field.title],
      type: [field.type],
      value: [field.value || ''],
      options: this.fb.array(field.options || [])
    });

    fieldArray.push(controlGroup);
  }

  // Function to send the form
  sendForm() {
    const formId = this.userId;
    const userIds = ['user1', 'user2', 'user3']; // Replace with actual users
    this.service.sendFormToUsers(formId, userIds).subscribe(response => {
      console.log('Form sent to users:', response);
    });
  }
}
