import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FormService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createForm(form: any): Observable<any> {
    return this.http.post(this.apiUrl+'/createForm', form);
  }

  getForms(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl+'/getForms');
  }

  getFormById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  updateForm(id: string, form: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, form);
  }

  deleteForm(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
