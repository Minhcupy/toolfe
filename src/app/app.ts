import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthTokenStore } from './core/auth/auth-token.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(
    protected readonly tokens: AuthTokenStore,
    private readonly router: Router,
  ) {}

  protected logout(): void {
    this.tokens.clear();
    void this.router.navigate(['/login']);
  }
}
