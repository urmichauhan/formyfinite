import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private apiUrl = environment.apiUrl;


  constructor(private http: HttpClient) {}

  // Fetch form configuration for the user
  getFormConfig(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/form-config/${userId}`);
  }

  // Function to send the form data to multiple users
  sendFormToUsers(formId: string, userIds: string[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-form`, { formId, userIds });
  }
}
