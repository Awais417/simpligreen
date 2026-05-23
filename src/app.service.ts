import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getApiInfo() {
    return {
      message: 'SimpliGreen Backend API',
      data: {
        name: 'backendapis',
        version: '1.0.0',
        docs: '/api/v1/health',
        environment: process.env.NODE_ENV ?? 'development',
      },
    };
  }
}
