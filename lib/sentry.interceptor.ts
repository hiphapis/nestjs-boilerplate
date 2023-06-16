import {
  ExecutionContext,
  Injectable,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import * as Sentry from '@sentry/node';

@Injectable()
export class SentryInterceptor implements NestInterceptor {
  isRpc: boolean;

  constructor() {
    this.isRpc = false;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    this.isRpc = context['contextType'] == 'rpc';

    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const scope = new Sentry.Scope();
        scope.setTag('request-type', context['contextType']);

        if (this.isRpc) {
          Sentry.setExtra('Body', request);
        } else {
          Sentry.setExtra('Body', request.body);
        }
        Sentry.captureException(error, scope);
        return null;
      }),
    );
  }
}