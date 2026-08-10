import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { apiErrorMessage } from '../../core/api/api-error';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-auth-page', imports: [ReactiveFormsModule],
  template: `
    <section class="auth-shell">
      <div class="story">
        <div class="logo"><span>V</span> VoxFlow</div>
        <p class="eyebrow">AI VIDEO LOCALIZATION</p>
        <h1>Một video.<br /><em>Mọi ngôn ngữ.</em></h1>
        <p class="lead">Biến lời nói thành bản dịch, giọng đọc và phụ đề khớp timeline — trong một workspace duy nhất.</p>
        <div class="proof"><span>01</span> Upload an toàn <span>02</span> Review từng câu <span>03</span> Render có kiểm soát</div>
      </div>
      <div class="auth-card card">
        <p class="eyebrow">{{ mode() === 'login' ? 'CHÀO MỪNG TRỞ LẠI' : 'TẠO WORKSPACE' }}</p>
        <h2>{{ mode() === 'login' ? 'Đăng nhập' : 'Bắt đầu miễn phí' }}</h2>
        <p class="sub">{{ mode() === 'login' ? 'Tiếp tục project đang xử lý.' : 'Tạo tài khoản để upload video đầu tiên.' }}</p>
        <form [formGroup]="form" (ngSubmit)="submit()">
          @if (mode() === 'register') { <div class="field"><label for="name">Tên hiển thị</label><input id="name" formControlName="displayName" autocomplete="name" /></div> }
          <div class="field"><label for="email">Email</label><input id="email" type="email" formControlName="email" autocomplete="email" /></div>
          <div class="field"><label for="password">Mật khẩu</label><input id="password" type="password" formControlName="password" autocomplete="current-password" /></div>
          @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid || submitting()">{{ submitting() ? 'Đang xử lý…' : (mode() === 'login' ? 'Đăng nhập' : 'Tạo tài khoản') }}</button>
        </form>
        <button class="switch" type="button" (click)="toggle()">{{ mode() === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập' }}</button>
      </div>
    </section>`,
  styles: [`
    :host { display:block; min-height:100dvh; background:linear-gradient(115deg,#171d35 0 52%,transparent 52%); }
    .auth-shell { min-height:100dvh; display:grid; grid-template-columns:1.08fr .92fr; align-items:center; gap:8vw; padding:7vh 8vw; }
    .story { color:white; max-width:620px; } .logo { display:flex;align-items:center;gap:.7rem;font:800 1.1rem Manrope;margin-bottom:14vh; }
    .logo span { display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:var(--brand); }
    h1 { font-size:clamp(3rem,6vw,6.4rem);line-height:.95;margin:.8rem 0 1.5rem; } h1 em { color:#9d92ff;font-style:normal; }
    .lead { color:#c3c8d9;max-width:540px;font-size:1.1rem;line-height:1.75; } .proof {display:flex;flex-wrap:wrap;gap:.8rem 1.2rem;margin-top:3rem;color:#abb2c7;font-size:.84rem}.proof span{color:#8f83ff;font-weight:800}
    .auth-card { width:min(480px,100%);padding:2.2rem;justify-self:center; } h2{font-size:2.2rem;margin:.35rem 0}.sub{color:var(--muted);margin:0 0 1.7rem}
    form{display:grid;gap:1rem}.btn{width:100%;margin-top:.4rem}.switch{display:block;margin:1.25rem auto 0;border:0;background:none;color:var(--brand-dark);font-weight:700;cursor:pointer}
    @media(max-width:850px){:host{background:#171d35}.auth-shell{grid-template-columns:1fr;padding:2rem 1rem}.story{display:none}.auth-card{padding:1.5rem}}
  `],
})
export class AuthPage {
  readonly mode = signal<'login' | 'register'>('login'); readonly submitting = signal(false); readonly error = signal('');
  readonly form = new FormGroup({ displayName: new FormControl(''), email: new FormControl('', [Validators.required, Validators.email]), password: new FormControl('', [Validators.required, Validators.minLength(8)]) });
  constructor(private readonly auth: AuthService, private readonly router: Router) {}
  toggle(): void { this.mode.update((m) => m === 'login' ? 'register' : 'login'); this.error.set(''); }
  submit(): void {
    if (this.form.invalid) return; this.submitting.set(true); this.error.set(''); const value=this.form.getRawValue();
    const request=this.mode()==='login' ? this.auth.login(value.email!,value.password!) : this.auth.register(value.email!,value.password!,value.displayName || 'VoxFlow user');
    request.pipe(finalize(()=>this.submitting.set(false))).subscribe({next:()=>void this.router.navigate(['/projects']),error:(e)=>this.error.set(apiErrorMessage(e))});
  }
}
