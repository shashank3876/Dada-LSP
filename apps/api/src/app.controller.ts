import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('System')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'System Health Check' })
  @ApiResponse({ status: 200, description: 'Service is operational' })
  getHealth() {
    return {
      status: 'ok',
      service: 'dada-api',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }

  @Get('api/health')
  @ApiOperation({ summary: 'System API Health Check' })
  @ApiResponse({ status: 200, description: 'API is operational' })
  getApiHealth() {
    return this.getHealth();
  }
}
