import { Controller, Dependencies, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  DiskHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
@Dependencies(
  HealthCheckService,
  HttpHealthIndicator,
  DiskHealthIndicator,
  MemoryHealthIndicator,
)
export class HealthController {
  constructor(private health, private http, private disk, private memory) {}

  @Get()
  @HealthCheck()
  healthCheck() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.5 }),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ])
  }
}
