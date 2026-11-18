import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthHeader } from '../../component/auth-header/auth-header';

@Component({
  selector: 'app-auth-router',
  imports: [RouterOutlet, AuthHeader],
  templateUrl: './auth-router.html',
  styleUrl: './auth-router.scss',
})
export class AuthRouter {}