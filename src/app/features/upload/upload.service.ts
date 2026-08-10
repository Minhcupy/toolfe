import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api.config';

interface InitiateResponse { assetId:string;uploadId:string;objectKey:string;partSize:number;partCount:number; }
interface PartUrlResponse { partNumber:number;url:string; }

@Injectable({providedIn:'root'})
export class UploadService{
 private readonly http=inject(HttpClient);private readonly base=inject(API_BASE_URL);private abort?:AbortController;
 async upload(projectId:string,file:File,onProgress:(value:number)=>void):Promise<void>{
  this.abort=new AbortController();const session=await firstValueFrom(this.http.post<InitiateResponse>(`${this.base}/projects/${projectId}/uploads/initiate`,{filename:file.name,mimeType:file.type||'video/mp4',sizeBytes:file.size}));
  const parts:{partNumber:number;eTag:string}[]=[];
  for(let partNumber=1;partNumber<=session.partCount;partNumber++){
   const signed=await firstValueFrom(this.http.post<PartUrlResponse>(`${this.base}/uploads/${session.assetId}/parts/${partNumber}/url`,{}));
   const start=(partNumber-1)*session.partSize;const chunk=file.slice(start,Math.min(start+session.partSize,file.size));
   const response=await fetch(signed.url,{method:'PUT',body:chunk,signal:this.abort.signal});if(!response.ok)throw new Error(`Upload part ${partNumber} thất bại (${response.status})`);
   const eTag=response.headers.get('ETag');if(!eTag)throw new Error('Object storage chưa expose ETag qua CORS.');parts.push({partNumber,eTag});onProgress(Math.round(partNumber/session.partCount*100));
   localStorage.setItem(`voxflow.upload.${projectId}`,JSON.stringify({assetId:session.assetId,uploadId:session.uploadId,lastPart:partNumber,fileName:file.name}));
  }
  await firstValueFrom(this.http.post(`${this.base}/uploads/${session.assetId}/complete`,{parts}));localStorage.removeItem(`voxflow.upload.${projectId}`);
 }
 cancel():void{this.abort?.abort();}
}
