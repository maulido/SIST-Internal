import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest();
    const { method, url, user } = request;
    const now = Date.now();

    return next
      .handle()
      .pipe(
        tap(() => {
          const delay = Date.now() - now;
          const userId = user ? user.email : 'Anonymous'; // Log user email if available
          this.logger.log(
            `${method} ${url} ${delay}ms - User: ${userId}`,
          );
        }),
      );
  }
}
