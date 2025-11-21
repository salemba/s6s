import { Controller, Get, Post, Req, Res, UseGuards, Body } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Handles Local Login.
   * Returns a JWT token upon successful authentication.
   */
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  /**
   * Initiates the SAML SSO login process.
   * This route would typically be guarded by a Passport SAML strategy.
   */
  @Get('saml/login')
  // @UseGuards(AuthGuard('saml'))
  async samlLogin() {
    // Passport automatically redirects to the IdP
  }

  /**
   * Handles the SAML SSO callback (ACS URL).
   * The IdP posts the SAML assertion to this endpoint.
   */
  @Post('saml/callback')
  // @UseGuards(AuthGuard('saml'))
  async samlCallback(@Req() req: Request, @Res() res: Response) {
    // 1. Passport validates the SAML assertion.
    // 2. The user object is populated in req.user.
    
    // 3. Sync User Groups from LDAP
    // const roles = await this.ldapService.syncUserGroups(req.user.username);
    // await this.authService.updateUserRoles(req.user.id, roles);

    // 4. Call AuthService to issue a JWT or session.
    // 5. Redirect the user to the frontend dashboard.
    
    res.redirect('/dashboard');
  }

  /**
   * Initiates the OIDC login process.
   */
  @Get('oidc/login')
  // @UseGuards(AuthGuard('oidc'))
  async oidcLogin() {
    // Passport automatically redirects to the OIDC provider
  }

  /**
   * Handles the OIDC callback.
   */
  @Get('oidc/callback')
  // @UseGuards(AuthGuard('oidc'))
  async oidcCallback(@Req() req: Request, @Res() res: Response) {
    // 1. Passport exchanges the code for tokens.
    // 2. The user object is populated in req.user.
    // 3. Call AuthService to issue a JWT or session.
    // 4. Redirect the user to the frontend dashboard.

    res.redirect('/dashboard');
  }
}
