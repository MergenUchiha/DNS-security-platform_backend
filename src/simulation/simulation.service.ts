import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import { StartSimulationInput, AttackType } from '../common/schemas/validation.schemas';

@Injectable()
export class SimulationService {
  private activeSimulations = new Map<string, NodeJS.Timeout>();

  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => EventsGateway))
    private eventsGateway: EventsGateway,
  ) {}

  async startSimulation(dto: StartSimulationInput) {
    console.log('🚀 [SIMULATION] Starting new simulation:', {
      type: dto.type,
      target: dto.targetDomain,
      intensity: dto.intensity,
      duration: `${dto.duration}s`,
    });

    // Create simulation record
    const simulation = await this.prisma.simulation.create({
      data: {
        attackType: dto.type as any,
        targetDomain: dto.targetDomain,
        spoofedIP: dto.spoofedIP,
        intensity: dto.intensity as any,
        duration: dto.duration,
        status: 'running',
      },
    });

    console.log('✅ [SIMULATION] Created in database:', simulation.id);

    // Create initial timeline event
    await this.prisma.timelineEvent.create({
      data: {
        simulationId: simulation.id,
        type: 'query',
        description: `Attack simulation started: ${this.getAttackTypeName(dto.type)}`,
        severity: 'info',
      },
    });

    // Start simulation logic
    this.runSimulation(simulation.id, dto);
    console.log('⚡ [SIMULATION] Attack simulation loop started');

    // Format response with config object
    const response = {
      ...simulation,
      config: {
        type: simulation.attackType,
        targetDomain: simulation.targetDomain,
        spoofedIP: simulation.spoofedIP,
        intensity: simulation.intensity,
        duration: simulation.duration,
      },
      metrics: {
        totalQueries: simulation.totalQueries,
        spoofedQueries: simulation.spoofedQueries,
        blockedQueries: simulation.blockedQueries,
        successRate: simulation.successRate,
      },
    };

    // Broadcast to clients
    this.eventsGateway.broadcastSimulationUpdate(response);
    console.log('📡 [SIMULATION] Broadcasted to WebSocket clients');

    return response;
  }

  private async runSimulation(simulationId: string, config: StartSimulationInput) {
    const interval = this.getIntervalByIntensity(config.intensity);
    let elapsed = 0;
    let queryCount = 0;

    console.log(`⏱️  [SIMULATION ${simulationId}] Running with ${interval}ms interval`);

    const simulationInterval = setInterval(async () => {
      elapsed += interval;
      queryCount++;

      // Generate DNS query
      await this.generateDNSQuery(simulationId, config);

      // Update simulation metrics every 5 queries
      if (queryCount % 5 === 0) {
        const simulation = await this.updateSimulationMetrics(simulationId);
        
        console.log(`📊 [SIMULATION ${simulationId}] Metrics update:`, {
          queries: simulation.totalQueries,
          spoofed: simulation.spoofedQueries,
          blocked: simulation.blockedQueries,
          successRate: `${simulation.successRate.toFixed(1)}%`,
        });
        
        // Broadcast update
        this.eventsGateway.broadcastSimulationUpdate(simulation);
      }

      // Check if simulation should stop
      if (elapsed >= config.duration * 1000) {
        console.log(`🛑 [SIMULATION ${simulationId}] Duration completed, stopping...`);
        clearInterval(simulationInterval);
        await this.stopSimulation(simulationId);
        this.activeSimulations.delete(simulationId);
      }
    }, interval);

    // Store interval reference
    this.activeSimulations.set(simulationId, simulationInterval);

    // Auto-stop after duration
    setTimeout(async () => {
      if (this.activeSimulations.has(simulationId)) {
        console.log(`⏰ [SIMULATION ${simulationId}] Auto-stop timeout reached`);
        clearInterval(simulationInterval);
        await this.stopSimulation(simulationId);
        this.activeSimulations.delete(simulationId);
      }
    }, config.duration * 1000);
  }

  private async generateDNSQuery(simulationId: string, config: StartSimulationInput) {
    const domains = [config.targetDomain, 'google.com', 'facebook.com', 'amazon.com'];
    const sourceIPs = ['192.168.1.', '10.0.0.', '172.16.0.'];

    const isSpoofed = Math.random() > 0.4; // 60% chance of spoofing
    const isBlocked = isSpoofed && Math.random() > 0.3; // 70% blocked if spoofed

    let status: 'pending' | 'resolved' | 'spoofed' | 'blocked';
    if (isBlocked) {
      status = 'blocked';
    } else if (isSpoofed) {
      status = 'spoofed';
    } else {
      status = 'resolved';
    }

    const query = await this.prisma.dNSQuery.create({
      data: {
        simulationId,
        domain: domains[Math.floor(Math.random() * domains.length)],
        queryType: 'A',
        sourceIP: sourceIPs[Math.floor(Math.random() * sourceIPs.length)] + Math.floor(Math.random() * 255),
        responseIP: status === 'resolved' 
          ? `142.250.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
          : config.spoofedIP,
        status,
        isSpoofed,
        responseTime: Math.floor(Math.random() * 100) + 10,
      },
    });

    // Create timeline event for significant actions
    if (status === 'spoofed' || status === 'blocked') {
      await this.prisma.timelineEvent.create({
        data: {
          simulationId,
          type: status,
          description: status === 'spoofed' 
            ? `DNS response spoofed for ${query.domain}`
            : `Malicious DNS response blocked for ${query.domain}`,
          severity: status === 'spoofed' ? 'danger' : 'success',
        },
      });
    }

    // Broadcast query
    this.eventsGateway.broadcastDNSQuery(query);

    return query;
  }

  private async updateSimulationMetrics(simulationId: string) {
    const queries = await this.prisma.dNSQuery.findMany({
      where: { simulationId },
    });

    const totalQueries = queries.length;
    const spoofedQueries = queries.filter((q) => q.isSpoofed).length;
    const blockedQueries = queries.filter((q) => q.status === 'blocked').length;
    const successRate = spoofedQueries > 0 
      ? ((spoofedQueries - blockedQueries) / spoofedQueries) * 100 
      : 0;

    const updated = await this.prisma.simulation.update({
      where: { id: simulationId },
      data: {
        totalQueries,
        spoofedQueries,
        blockedQueries,
        successRate,
      },
    });

    // Format response with config
    return {
      ...updated,
      config: {
        type: updated.attackType,
        targetDomain: updated.targetDomain,
        spoofedIP: updated.spoofedIP,
        intensity: updated.intensity,
        duration: updated.duration,
      },
      metrics: {
        totalQueries: updated.totalQueries,
        spoofedQueries: updated.spoofedQueries,
        blockedQueries: updated.blockedQueries,
        successRate: updated.successRate,
      },
    };
  }

  async stopSimulation(id: string) {
    console.log(`🛑 [SIMULATION ${id}] Stopping simulation...`);

    const simulation = await this.prisma.simulation.findUnique({
      where: { id },
    });

    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    // Stop interval if running
    if (this.activeSimulations.has(id)) {
      clearInterval(this.activeSimulations.get(id));
      this.activeSimulations.delete(id);
      console.log(`✅ [SIMULATION ${id}] Interval cleared`);
    }

    // Update simulation status
    const updated = await this.prisma.simulation.update({
      where: { id },
      data: {
        status: 'completed',
        endTime: new Date(),
      },
    });

    console.log(`✅ [SIMULATION ${id}] Status updated to completed`);

    // Create final timeline event
    await this.prisma.timelineEvent.create({
      data: {
        simulationId: id,
        type: 'resolved',
        description: 'Attack simulation completed',
        severity: 'info',
      },
    });

    // Format response with config
    const response = {
      ...updated,
      config: {
        type: updated.attackType,
        targetDomain: updated.targetDomain,
        spoofedIP: updated.spoofedIP,
        intensity: updated.intensity,
        duration: updated.duration,
      },
      metrics: {
        totalQueries: updated.totalQueries,
        spoofedQueries: updated.spoofedQueries,
        blockedQueries: updated.blockedQueries,
        successRate: updated.successRate,
      },
    };

    // Broadcast update
    this.eventsGateway.broadcastSimulationUpdate(response);
    console.log(`📡 [SIMULATION ${id}] Final state broadcasted`);

    return response;
  }

  async getSimulation(id: string) {
    const simulation = await this.prisma.simulation.findUnique({
      where: { id },
      include: {
        queries: {
          orderBy: { timestamp: 'desc' },
          take: 50,
        },
        events: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
    });

    if (!simulation) {
      throw new NotFoundException('Simulation not found');
    }

    // Format response with config
    return {
      ...simulation,
      config: {
        type: simulation.attackType,
        targetDomain: simulation.targetDomain,
        spoofedIP: simulation.spoofedIP,
        intensity: simulation.intensity,
        duration: simulation.duration,
      },
    };
  }

  async getAllSimulations() {
    return await this.prisma.simulation.findMany({
      orderBy: { startTime: 'desc' },
      take: 20,
    });
  }

  private getIntervalByIntensity(intensity: string): number {
    switch (intensity) {
      case 'low':
        return 2000; // 2 seconds
      case 'medium':
        return 1000; // 1 second
      case 'high':
        return 500; // 0.5 seconds
      default:
        return 1000;
    }
  }

  private getAttackTypeName(type: AttackType): string {
    const names: Record<AttackType, string> = {
      dns_cache_poisoning: 'DNS Cache Poisoning',
      man_in_the_middle: 'Man-in-the-Middle Attack',
      local_dns_hijack: 'Local DNS Hijack',
      rogue_dns_server: 'Rogue DNS Server',
    };
    return names[type] || type;
  }
}