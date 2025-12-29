import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMitigationConfigInput } from '../common/schemas/validation.schemas';

@Injectable()
export class MitigationService {
  constructor(private prisma: PrismaService) {}

  async getConfig() {
    let config = await this.prisma.mitigationConfig.findFirst();

    // Create default config if not exists
    if (!config) {
      config = await this.prisma.mitigationConfig.create({
        data: {
          dnssecEnabled: true,
          firewallEnabled: true,
          ratelimitingEnabled: true,
          maxQueriesPerSecond: 100,
          ipWhitelist: ['8.8.8.8', '1.1.1.1'],
          ipBlacklist: [],
          trustedResolvers: ['8.8.8.8', '1.1.1.1', '208.67.222.222'],
        },
      });
    }

    return config;
  }

  async updateConfig(dto: UpdateMitigationConfigInput) {
    const config = await this.getConfig();

    return await this.prisma.mitigationConfig.update({
      where: { id: config.id },
      data: dto,
    });
  }

  async getMetrics() {
    // Get latest metrics
    const latestMetrics = await this.prisma.securityMetrics.findFirst({
      orderBy: { timestamp: 'desc' },
    });

    // If no metrics exist, create default
    if (!latestMetrics) {
      return {
        threatsDetected: 0,
        threatsBlocked: 0,
        dnssecValidations: 0,
        avgResponseTime: 0,
        uptime: 100,
        totalQueries: 0,
        maliciousQueries: 0,
        legitimateQueries: 0,
      };
    }

    return latestMetrics;
  }

  async recordMetrics() {
    // Calculate current metrics
    const simulations = await this.prisma.simulation.findMany({
      where: {
        startTime: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
    });

    const totalQueries = simulations.reduce((sum, s) => sum + s.totalQueries, 0);
    const spoofedQueries = simulations.reduce((sum, s) => sum + s.spoofedQueries, 0);
    const blockedQueries = simulations.reduce((sum, s) => sum + s.blockedQueries, 0);

    const queries = await this.prisma.dNSQuery.findMany({
      where: {
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const avgResponseTime = queries.length > 0
      ? queries.reduce((sum, q) => sum + (q.responseTime || 0), 0) / queries.length
      : 0;

    return await this.prisma.securityMetrics.create({
      data: {
        threatsDetected: spoofedQueries,
        threatsBlocked: blockedQueries,
        dnssecValidations: blockedQueries,
        avgResponseTime,
        uptime: 99.5 + Math.random() * 0.5,
        totalQueries,
        maliciousQueries: spoofedQueries,
        legitimateQueries: totalQueries - spoofedQueries,
      },
    });
  }
}