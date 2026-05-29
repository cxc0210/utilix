import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../interfaces/api-response.interface';

type ErrorResponseBody = {
  message?: string | string[];
  code?: number;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const body =
      typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? (exceptionResponse as ErrorResponseBody)
        : undefined;

    const message = this.resolveMessage(exception, body);
    const code = body?.code ?? status;

    response.status(status).json({
      code,
      data: {},
      message,
    } satisfies ApiResponse<Record<string, never>>);
  }

  private resolveMessage(exception: unknown, body?: ErrorResponseBody) {
    if (Array.isArray(body?.message)) {
      return body.message.join(', ');
    }

    if (typeof body?.message === 'string') {
      return body.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal server error';
  }
}
