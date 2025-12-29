import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default mitigation configuration
  const mitigationConfig = await prisma.mitigationConfig.create({
    data: {
      dnssecEnabled: true,
      firewallEnabled: true,
      ratelimitingEnabled: true,
      maxQueriesPerSecond: 100,
      ipWhitelist: ['8.8.8.8', '1.1.1.1', '208.67.222.222'],
      ipBlacklist: ['192.168.100.1', '10.0.0.50'],
      trustedResolvers: ['8.8.8.8', '1.1.1.1', '208.67.222.222', '9.9.9.9'],
    },
  });

  console.log('✅ Created mitigation configuration');

  // Create sample completed simulation
  const simulation1 = await prisma.simulation.create({
    data: {
      attackType: 'dns_cache_poisoning',
      targetDomain: 'example.com',
      spoofedIP: '192.168.1.100',
      intensity: 'high',
      duration: 120,
      status: 'completed',
      startTime: new Date(Date.now() - 7200000), // 2 hours ago
      endTime: new Date(Date.now() - 5400000), // 1.5 hours ago
      totalQueries: 245,
      spoofedQueries: 68,
      blockedQueries: 52,
      successRate: 23.5,
    },
  });

  console.log('✅ Created sample simulation 1');

  // Create sample DNS queries for simulation
  const domains = ['example.com', 'test.com', 'secure.com', 'banking.com', 'shop.com'];
  const queryStatuses = ['resolved', 'spoofed', 'blocked'];

  for (let i = 0; i < 30; i++) {
    const status = queryStatuses[Math.floor(Math.random() * queryStatuses.length)];
    await prisma.dNSQuery.create({
      data: {
        simulationId: simulation1.id,
        domain: domains[Math.floor(Math.random() * domains.length)],
        queryType: 'A',
        sourceIP: `192.168.1.${Math.floor(Math.random() * 255)}`,
        responseIP: status === 'resolved' ? `142.250.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}` : '192.168.1.100',
        status: status as any,
        isSpoofed: status === 'spoofed',
        timestamp: new Date(Date.now() - Math.random() * 7200000),
        responseTime: Math.floor(Math.random() * 100) + 10,
      },
    });
  }

  console.log('✅ Created 30 sample DNS queries');

  // Create timeline events
  await prisma.timelineEvent.createMany({
    data: [
      {
        simulationId: simulation1.id,
        timestamp: new Date(Date.now() - 7200000),
        type: 'query',
        description: 'Attack simulation started',
        severity: 'info',
      },
      {
        simulationId: simulation1.id,
        timestamp: new Date(Date.now() - 7000000),
        type: 'spoofed',
        description: 'DNS response spoofed for example.com',
        severity: 'warning',
      },
      {
        simulationId: simulation1.id,
        timestamp: new Date(Date.now() - 6800000),
        type: 'blocked',
        description: 'Malicious DNS response blocked by DNSSEC',
        severity: 'success',
      },
      {
        simulationId: simulation1.id,
        timestamp: new Date(Date.now() - 5400000),
        type: 'resolved',
        description: 'Attack simulation completed',
        severity: 'info',
      },
    ],
  });

  console.log('✅ Created timeline events');

  // Create security metrics for the last 7 days
  for (let i = 0; i < 7; i++) {
    await prisma.securityMetrics.create({
      data: {
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
        threatsDetected: Math.floor(Math.random() * 50) + 20,
        threatsBlocked: Math.floor(Math.random() * 40) + 15,
        dnssecValidations: Math.floor(Math.random() * 100) + 50,
        avgResponseTime: Math.random() * 30 + 10,
        uptime: 99.5 + Math.random() * 0.5,
        totalQueries: Math.floor(Math.random() * 500) + 200,
        maliciousQueries: Math.floor(Math.random() * 30) + 10,
        legitimateQueries: Math.floor(Math.random() * 470) + 190,
      },
    });
  }

  console.log('✅ Created security metrics for last 7 days');

  // Create attack statistics for the last 7 days
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const total = Math.floor(Math.random() * 50) + 20;
    const blocked = Math.floor(total * (0.7 + Math.random() * 0.2));

    await prisma.attackStatistics.create({
      data: {
        date,
        total,
        blocked,
        successful: total - blocked,
        cachePoisoning: Math.floor(total * 0.4),
        manInTheMiddle: Math.floor(total * 0.3),
        dnsHijack: Math.floor(total * 0.2),
        rogueServer: Math.floor(total * 0.1),
      },
    });
  }

  console.log('✅ Created attack statistics for last 7 days');

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });