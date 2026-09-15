import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // 1. Build the baseline RFC 7807 Problem Details object
    const problemDetails: any = {
      // 'type' is ideally a URL to your error documentation. We'll use a URN for now.
      type: `urn:reeool:error:http:${status}`,
      title: exceptionResponse.error || exception.message || 'An error occurred',
      status: status,
      detail: 'An unexpected error occurred.',
      instance: request.url,
    };

    // 2. Handle class-validator arrays dynamically
    if (Array.isArray(exceptionResponse.message)) {
      problemDetails.detail = 'One or more validation errors occurred.';
      // RFC 7807 allows custom extension properties. We add 'errors' for validation constraints.
      problemDetails.errors = exceptionResponse.message; 
    } else if (typeof exceptionResponse.message === 'string') {
      problemDetails.detail = exceptionResponse.message;
    }

    // 3. Send the response with the strict application/problem+json content type
    response
      .status(status)
      .header('Content-Type', 'application/problem+json')
      .json(problemDetails);
  }
}