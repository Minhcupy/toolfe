import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';
import { CreateProject, VideoProject } from './project.models';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private readonly http=inject(HttpClient); private readonly base=inject(API_BASE_URL);
  list(): Observable<VideoProject[]> { return this.http.get<VideoProject[]>(`${this.base}/projects`); }
  create(request: CreateProject): Observable<VideoProject> { return this.http.post<VideoProject>(`${this.base}/projects`,request); }
}
