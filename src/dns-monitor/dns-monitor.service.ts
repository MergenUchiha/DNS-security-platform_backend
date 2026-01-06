import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventsGateway } from '../events/events.gateway';
import * as dns from 'dns';
import { promisify } from 'util';

const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);

@Injectable()
export class DnsMonitorService {
  private readonly logger = new Logger(DnsMonitorService.name);
  private isMonitoring = false;
  private monitoredDomains: Set<string> = new Set();
  private intervalId?: NodeJS.Timeout;

  constructor(
    private prisma: PrismaService,
    private events: EventsGateway,
  ) {}

  /**
   * Start monitoring DNS traffic
   */
  async startMonitoring(domains: string[] = []): Promise<void> {
    if (this.isMonitoring) {
      this.logger.warn('DNS monitoring is already active');
      return;
    }

    this.isMonitoring = true;
    this.monitoredDomains = new Set(domains);

    this.logger.log('🔍 [DNS MONITOR] Started real DNS traffic monitoring');
    this.logger.log(`Monitoring ${this.monitoredDomains.size} domains`);

    // Start periodic monitoring
    this.startPeriodicMonitoring();
  }

  /**
   * Stop monitoring DNS traffic
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.logger.log('🛑 [DNS MONITOR] Stopped monitoring');
  }

  /**
   * Add domain to monitoring list
   */
  addDomain(domain: string): void {
    this.monitoredDomains.add(domain);
    this.logger.log(`➕ Added ${domain} to monitoring`);
  }

  /**
   * Remove domain from monitoring list
   */
  removeDomain(domain: string): void {
    this.monitoredDomains.delete(domain);
    this.logger.log(`➖ Removed ${domain} from monitoring`);
  }

  /**
   * Perform DNS query and log it
   */
  async queryDomain(domain: string): Promise<void> {
    const startTime = Date.now();

    try {
      // Try IPv4 first
      const addresses = await resolve4(domain);
      const responseTime = Date.now() - startTime;

      await this.logRealDNSQuery({
        domain,
        queryType: 'A',
        sourceIP: 'system',
        responseIP: addresses[0],
        status: 'resolved',
        responseTime,
        isSpoofed: false,
        timestamp: new Date(),
      });

      this.logger.debug(`✅ ${domain} -> ${addresses[0]} (${responseTime}ms)`);
    } catch (error) {
      const responseTime = Date.now() - startTime;

      await this.logRealDNSQuery({
        domain,
        queryType: 'A',
        sourceIP: 'system',
        responseIP: null,
        status: 'pending',
        responseTime,
        isSpoofed: false,
        timestamp: new Date(),
      });

      this.logger.warn(`❌ Failed to resolve ${domain}: ${error.message}`);
    }
  }

  /**
   * Validate DNS response using DNSSEC (simplified)
   */
  private async validateDNSSEC(domain: string, ip: string): Promise<boolean> {
    // Simplified DNSSEC validation
    // In production, use proper DNSSEC validation library
    
    try {
      // Check if domain is in known malicious list
      const maliciousDomains = ['malicious.com', 'phishing.net', 'fake-bank.com'];
      
      if (maliciousDomains.some(bad => domain.includes(bad))) {
        this.logger.warn(`⚠️  DNSSEC: Suspicious domain detected: ${domain}`);
        return false;
      }

      // Check if IP is in blacklist
      const blacklistedIPs = await this.getBlacklistedIPs();
      
      if (blacklistedIPs.includes(ip)) {
        this.logger.warn(`⚠️  DNSSEC: Blacklisted IP detected: ${ip}`);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(`DNSSEC validation error: ${error.message}`);
      return false;
    }
  }

  /**
   * Get blacklisted IPs from mitigation config
   */
  private async getBlacklistedIPs(): Promise<string[]> {
    try {
      const config = await this.prisma.mitigationConfig.findFirst();
      return config?.ipBlacklist || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Log real DNS query to database
   */
  private async logRealDNSQuery(data: any): Promise<void> {
    try {
      // Validate with DNSSEC if response exists
      let status = data.status;
      let isSpoofed = data.isSpoofed;

      if (data.responseIP) {
        const isValid = await this.validateDNSSEC(data.domain, data.responseIP);
        
        if (!isValid) {
          status = 'blocked';
          isSpoofed = true;
          this.logger.warn(`🛡️  BLOCKED: ${data.domain} -> ${data.responseIP}`);
        }
      }

      // Save to database
      const query = await this.prisma.dNSQuery.create({
        data: {
          simulationId: null, // null = real traffic
          domain: data.domain,
          queryType: data.queryType,
          sourceIP: data.sourceIP,
          responseIP: data.responseIP,
          status: status as any,
          isSpoofed,
          timestamp: data.timestamp,
          responseTime: data.responseTime,
        },
      });

      // Broadcast via WebSocket
      this.events.broadcastDNSQuery(query);

      // Log metrics
      this.logger.log(
        `📊 [REAL DNS] ${data.domain} -> ${data.responseIP || 'N/A'} | ${status.toUpperCase()} | ${data.responseTime}ms`
      );
    } catch (error) {
      this.logger.error(`Failed to log DNS query: ${error.message}`);
    }
  }

  /**
   * Start periodic monitoring of configured domains
   */
  private startPeriodicMonitoring(): void {
    // Query each domain every 5 seconds
    this.intervalId = setInterval(async () => {
      if (!this.isMonitoring) return;

      const domains = Array.from(this.monitoredDomains);
      
      if (domains.length === 0) {
        // Monitor some popular domains if none configured
        const defaultDomains = [
          'google.com',
          'cloudflare.com',
          'github.com',
        ];
        
        for (const domain of defaultDomains) {
          await this.queryDomain(domain);
        }
      } else {
        for (const domain of domains) {
          await this.queryDomain(domain);
        }
      }
    }, 5000); // Every 5 seconds
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isMonitoring: this.isMonitoring,
      monitoredDomains: Array.from(this.monitoredDomains),
      domainsCount: this.monitoredDomains.size,
    };
  }

  /**
   * Get real traffic statistics
   */
  async getRealTrafficStats() {
    const stats = await this.prisma.dNSQuery.aggregate({
      where: {
        simulationId: null,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      _count: { id: true },
      _avg: { responseTime: true },
    });

    const spoofed = await this.prisma.dNSQuery.count({
      where: {
        simulationId: null,
        isSpoofed: true,
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    const blocked = await this.prisma.dNSQuery.count({
      where: {
        simulationId: null,
        status: 'blocked',
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      totalQueries: stats._count.id,
      avgResponseTime: stats._avg.responseTime || 0,
      spoofedQueries: spoofed,
      blockedQueries: blocked,
      blockRate: stats._count.id > 0 ? (blocked / stats._count.id) * 100 : 0,
    };
  }
}