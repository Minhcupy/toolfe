import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../core/api/api-error';
import { AuthTokenStore } from '../../core/auth/auth-token.store';
import { VideoProject } from './project.models';
import { ProjectService } from './project.service';

@Component({selector:'app-project-list',imports:[RouterLink,DatePipe],template:`
  <section class="page">
    <div class="hero"><div><p class="eyebrow">WORKSPACE</p><h1>Xin chào, {{ tokens.currentUser()?.name }}.</h1><p>Đưa video của bạn tới khán giả mới.</p></div><a class="btn btn-primary" routerLink="/projects/new">＋ Project mới</a></div>
    <div class="stats"><div><strong>{{ projects().length }}</strong><span>Tổng project</span></div><div><strong>{{ completedCount() }}</strong><span>Đã hoàn thành</span></div><div><strong>{{ activeCount() }}</strong><span>Đang xử lý</span></div></div>
    <div class="section-head"><div><p class="eyebrow">GẦN ĐÂY</p><h2>Video projects</h2></div></div>
    @if (loading()) { <div class="empty card">Đang tải projects…</div> }
    @else if (error()) { <div class="empty card error">{{ error() }}</div> }
    @else if (!projects().length) { <div class="empty card"><div class="empty-icon">▶</div><h3>Chưa có video nào</h3><p>Tạo project đầu tiên, sau đó upload video để bắt đầu.</p><a class="btn btn-primary" routerLink="/projects/new">Tạo project</a></div> }
    @else { <div class="grid">@for(project of projects();track project.id){<article class="project-card card"><div class="thumb"><span>{{ project.sourceLanguage.toUpperCase() }} → {{ project.targetLanguage.toUpperCase() }}</span><div class="play">▶</div></div><div class="body"><span class="status" [attr.data-status]="project.status">{{ project.status }}</span><h3>{{ project.name }}</h3><p>{{ project.createdAt | date:'dd/MM/yyyy, HH:mm' }}</p><a class="btn btn-secondary" [routerLink]="['/projects',project.id,'upload']">Mở project</a></div></article>}</div> }
  </section>`,styles:[`
  .hero{display:flex;justify-content:space-between;align-items:end;gap:2rem;margin:1.5rem 0 2rem}.hero h1{font-size:clamp(2.1rem,4vw,4rem);margin:.3rem 0}.hero p:last-child{color:var(--muted);font-size:1.08rem}.stats{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid var(--line);border-radius:18px;background:white;margin-bottom:3.5rem}.stats div{display:flex;align-items:center;gap:1rem;padding:1.25rem 1.5rem}.stats div+div{border-left:1px solid var(--line)}.stats strong{font:800 1.7rem Manrope}.stats span{color:var(--muted);font-size:.87rem}.section-head h2{margin:.25rem 0 1.2rem;font-size:1.7rem}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:1.2rem}.project-card{overflow:hidden;box-shadow:none;transition:.2s}.project-card:hover{transform:translateY(-3px);box-shadow:var(--shadow)}.thumb{height:145px;padding:1rem;background:linear-gradient(145deg,#1c2440,#5046b7);color:#c9c5ff;display:flex;justify-content:space-between}.play{align-self:center;font-size:1.4rem;color:white}.body{padding:1.1rem}.body h3{margin:.55rem 0 .35rem}.body p{color:var(--muted);font-size:.83rem}.body .btn{width:100%;margin-top:.8rem}.status{font-size:.7rem;font-weight:800;color:var(--brand-dark);background:var(--brand-soft);padding:.3rem .5rem;border-radius:20px}.empty{text-align:center;padding:4.5rem 2rem;box-shadow:none}.empty-icon{display:grid;place-items:center;width:64px;height:64px;margin:auto;border-radius:20px;background:var(--brand-soft);color:var(--brand)}.empty h3{font-size:1.4rem;margin-bottom:.4rem}.empty p{color:var(--muted);margin-bottom:1.2rem}@media(max-width:650px){.hero{align-items:start;flex-direction:column}.stats{grid-template-columns:1fr}.stats div+div{border-left:0;border-top:1px solid var(--line)}}
  `]})
export class ProjectListPage implements OnInit {
  readonly projects=signal<VideoProject[]>([]);readonly loading=signal(true);readonly error=signal('');
  constructor(readonly tokens:AuthTokenStore,private readonly service:ProjectService){}
  ngOnInit():void{this.service.list().subscribe({next:(v)=>{this.projects.set(v);this.loading.set(false)},error:(e)=>{this.error.set(apiErrorMessage(e));this.loading.set(false)}})}
  completedCount():number{return this.projects().filter(p=>p.status==='COMPLETED').length} activeCount():number{return this.projects().filter(p=>!['CREATED','COMPLETED','FAILED'].includes(p.status)).length}
}
