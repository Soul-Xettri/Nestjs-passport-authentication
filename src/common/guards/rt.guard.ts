import { AuthGuard } from '@nestjs/passport';
export class RtGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    console.log("hello")
    super();
  }
}
