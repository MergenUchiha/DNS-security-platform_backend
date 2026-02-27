// prisma/seed.js
// Запуск: node prisma/seed.js
// Не требует ts-node, работает на любом Node.js >= 18

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const LEGIT_IP = process.env.LEGIT_IP ?? '172.20.0.11';
const FAKE_IP = process.env.FAKE_IP ?? '172.20.0.12';
const DOMAIN = process.env.DEFAULT_POLICY_DOMAIN ?? 'bank.lab';

// ── helpers ──────────────────────────────────────────────────────────────────

async function logEvent(sessionId, type, severity, payload, msAgo = 0) {
  return prisma.event.create({
    data: {
      sessionId,
      type,
      severity,
      payload: payload ?? null,
      ts: new Date(Date.now() - msAgo),
    },
  });
}

async function createQuery(
  sessionId,
  {
    name,
    qtype = 'A',
    resolver,
    answer,
    ttl = 60,
    rttMs,
    finalAnswer,
    finalAction,
    msAgo = 0,
  },
) {
  return prisma.dnsQuery.create({
    data: {
      sessionId,
      name,
      qtype,
      resolver,
      answer,
      ttl,
      rttMs: rttMs ?? Math.floor(Math.random() * 25) + 5,
      finalAnswer,
      finalAction,
      ts: new Date(Date.now() - msAgo),
    },
  });
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  DNS Lab Seed — старт...\n');

  // Очистка
  console.log('🧹  Очистка базы...');
  await prisma.dnsQuery.deleteMany();
  await prisma.event.deleteMany();
  await prisma.mitigationPolicy.deleteMany();
  await prisma.labSession.deleteMany();
  console.log('    ✓ Готово\n');

  // ════════════════════════════════════════════════════════════════════
  // СЕССИЯ 1 — завершённая (2 часа назад, полный цикл SAFE→ATTACK→MITIGATED)
  // ════════════════════════════════════════════════════════════════════
  console.log('📦  Создание сессии 1 (завершённая демо-сессия)...');

  const H2 = 1000 * 60 * 60 * 2; // 2 часа назад в мс

  const s1 = await prisma.labSession.create({
    data: {
      mode: 'SAFE',
      createdAt: new Date(Date.now() - H2),
      endedAt: new Date(Date.now() - 1000 * 60 * 30), // закрыта 30 мин назад
    },
  });

  await prisma.mitigationPolicy.create({
    data: {
      sessionId: s1.id,
      domain: DOMAIN,
      action: 'FORCE_SAFE_IP',
      allowedIps: [LEGIT_IP],
    },
  });
  await prisma.mitigationPolicy.create({
    data: {
      sessionId: s1.id,
      domain: 'shop.lab',
      action: 'BLOCK',
      allowedIps: [LEGIT_IP],
    },
  });

  // --- SAFE режим ---
  await logEvent(
    s1.id,
    'SESSION_STARTED',
    'INFO',
    { note: 'seed demo session' },
    H2,
  );
  await logEvent(
    s1.id,
    'MITIGATION_POLICY_UPSERTED',
    'INFO',
    {
      domain: DOMAIN,
      action: 'FORCE_SAFE_IP',
      allowedIps: [LEGIT_IP],
      auto: true,
    },
    H2 - 1000,
  );
  await logEvent(s1.id, 'MODE_CHANGED', 'INFO', { mode: 'SAFE' }, H2 - 2000);

  await createQuery(s1.id, {
    name: DOMAIN,
    resolver: 'LEGIT',
    answer: LEGIT_IP,
    finalAnswer: LEGIT_IP,
    finalAction: 'PASS',
    rttMs: 8,
    msAgo: H2 - 5000,
  });
  await createQuery(s1.id, {
    name: 'shop.lab',
    resolver: 'LEGIT',
    answer: LEGIT_IP,
    finalAnswer: LEGIT_IP,
    finalAction: 'PASS',
    rttMs: 6,
    msAgo: H2 - 10000,
  });
  await createQuery(s1.id, {
    name: DOMAIN,
    resolver: 'LEGIT',
    answer: LEGIT_IP,
    finalAnswer: LEGIT_IP,
    finalAction: 'PASS',
    rttMs: 9,
    msAgo: H2 - 15000,
  });

  await logEvent(
    s1.id,
    'DNS_QUERY',
    'INFO',
    { name: DOMAIN, type: 'A', resolver: 'LEGIT' },
    H2 - 5000,
  );
  await logEvent(
    s1.id,
    'DNS_RESPONSE',
    'INFO',
    { name: DOMAIN, answer: LEGIT_IP, finalAction: 'PASS' },
    H2 - 4800,
  );

  // --- ATTACK режим ---
  await logEvent(s1.id, 'MODE_CHANGED', 'INFO', { mode: 'ATTACK' }, H2 - 20000);
  await logEvent(
    s1.id,
    'MITIGATION_DISABLED',
    'INFO',
    { mode: 'ATTACK' },
    H2 - 21000,
  );

  await createQuery(s1.id, {
    name: DOMAIN,
    resolver: 'SPOOF',
    answer: FAKE_IP,
    finalAnswer: FAKE_IP,
    finalAction: 'PASS',
    rttMs: 12,
    msAgo: H2 - 25000,
  });
  await createQuery(s1.id, {
    name: 'shop.lab',
    resolver: 'SPOOF',
    answer: FAKE_IP,
    finalAnswer: FAKE_IP,
    finalAction: 'PASS',
    rttMs: 11,
    msAgo: H2 - 30000,
  });
  await createQuery(s1.id, {
    name: DOMAIN,
    resolver: 'SPOOF',
    answer: FAKE_IP,
    finalAnswer: FAKE_IP,
    finalAction: 'PASS',
    rttMs: 14,
    msAgo: H2 - 35000,
  });

  await logEvent(
    s1.id,
    'DNS_QUERY',
    'INFO',
    { name: DOMAIN, type: 'A', resolver: 'SPOOF' },
    H2 - 25000,
  );
  await logEvent(
    s1.id,
    'DNS_RESPONSE',
    'WARN',
    {
      name: DOMAIN,
      answer: FAKE_IP,
      finalAction: 'PASS',
      note: 'attack - no mitigation',
    },
    H2 - 24800,
  );

  // --- MITIGATED режим ---
  await logEvent(
    s1.id,
    'MODE_CHANGED',
    'INFO',
    { mode: 'MITIGATED' },
    H2 - 40000,
  );
  await logEvent(s1.id, 'MITIGATION_ENABLED', 'INFO', {}, H2 - 41000);

  // bank.lab → FORCE_SAFE_IP
  await createQuery(s1.id, {
    name: DOMAIN,
    resolver: 'SPOOF',
    answer: FAKE_IP,
    finalAnswer: LEGIT_IP,
    finalAction: 'FORCE_SAFE_IP',
    rttMs: 13,
    msAgo: H2 - 45000,
  });
  await logEvent(
    s1.id,
    'DNS_QUERY',
    'INFO',
    { name: DOMAIN, type: 'A', resolver: 'SPOOF' },
    H2 - 45000,
  );
  await logEvent(
    s1.id,
    'SPOOF_DETECTED',
    'ALERT',
    {
      domain: DOMAIN,
      resolvedIp: FAKE_IP,
      allowed: [LEGIT_IP],
      action: 'FORCE_SAFE_IP',
    },
    H2 - 44800,
  );
  await logEvent(
    s1.id,
    'SAFE_RESOLUTION_FORCED',
    'WARN',
    { domain: DOMAIN, forcedIp: LEGIT_IP },
    H2 - 44600,
  );
  await logEvent(
    s1.id,
    'DNS_RESPONSE',
    'WARN',
    {
      name: DOMAIN,
      answer: FAKE_IP,
      finalAction: 'FORCE_SAFE_IP',
      finalAnswer: LEGIT_IP,
    },
    H2 - 44400,
  );

  // shop.lab → BLOCK
  await createQuery(s1.id, {
    name: 'shop.lab',
    resolver: 'SPOOF',
    answer: FAKE_IP,
    finalAnswer: null,
    finalAction: 'BLOCK',
    rttMs: 10,
    msAgo: H2 - 50000,
  });
  await logEvent(
    s1.id,
    'DNS_QUERY',
    'INFO',
    { name: 'shop.lab', type: 'A', resolver: 'SPOOF' },
    H2 - 50000,
  );
  await logEvent(
    s1.id,
    'SPOOF_DETECTED',
    'ALERT',
    {
      domain: 'shop.lab',
      resolvedIp: FAKE_IP,
      allowed: [LEGIT_IP],
      action: 'BLOCK',
    },
    H2 - 49800,
  );
  await logEvent(
    s1.id,
    'SPOOF_BLOCKED',
    'ALERT',
    { domain: 'shop.lab' },
    H2 - 49600,
  );

  // ещё один bank.lab → FORCE_SAFE_IP
  await createQuery(s1.id, {
    name: DOMAIN,
    resolver: 'SPOOF',
    answer: FAKE_IP,
    finalAnswer: LEGIT_IP,
    finalAction: 'FORCE_SAFE_IP',
    rttMs: 7,
    msAgo: H2 - 55000,
  });
  await logEvent(
    s1.id,
    'SPOOF_DETECTED',
    'ALERT',
    {
      domain: DOMAIN,
      resolvedIp: FAKE_IP,
      allowed: [LEGIT_IP],
      action: 'FORCE_SAFE_IP',
    },
    H2 - 55000,
  );
  await logEvent(
    s1.id,
    'SAFE_RESOLUTION_FORCED',
    'WARN',
    { domain: DOMAIN, forcedIp: LEGIT_IP },
    H2 - 54800,
  );

  await logEvent(s1.id, 'LAB_RESET', 'INFO', {}, H2 - 60000);
  await logEvent(s1.id, 'SESSION_ENDED', 'INFO', {}, H2 - 65000);

  console.log(`    ✓ Сессия 1: ${s1.id}`);

  // ════════════════════════════════════════════════════════════════════
  // СЕССИЯ 2 — активная (5 минут назад, режим SAFE)
  // ════════════════════════════════════════════════════════════════════
  console.log('📦  Создание сессии 2 (активная)...');

  const M5 = 1000 * 60 * 5;

  const s2 = await prisma.labSession.create({
    data: {
      mode: 'SAFE',
      createdAt: new Date(Date.now() - M5),
    },
  });

  await prisma.mitigationPolicy.create({
    data: {
      sessionId: s2.id,
      domain: DOMAIN,
      action: 'FORCE_SAFE_IP',
      allowedIps: [LEGIT_IP],
    },
  });

  await logEvent(
    s2.id,
    'SESSION_STARTED',
    'INFO',
    { note: 'active session' },
    M5,
  );
  await logEvent(
    s2.id,
    'MITIGATION_POLICY_UPSERTED',
    'INFO',
    {
      domain: DOMAIN,
      action: 'FORCE_SAFE_IP',
      allowedIps: [LEGIT_IP],
      auto: true,
    },
    M5 - 1000,
  );
  await logEvent(s2.id, 'MODE_CHANGED', 'INFO', { mode: 'SAFE' }, M5 - 2000);

  await createQuery(s2.id, {
    name: DOMAIN,
    resolver: 'LEGIT',
    answer: LEGIT_IP,
    finalAnswer: LEGIT_IP,
    finalAction: 'PASS',
    rttMs: 7,
    msAgo: M5 - 3000,
  });
  await createQuery(s2.id, {
    name: DOMAIN,
    resolver: 'LEGIT',
    answer: LEGIT_IP,
    finalAnswer: LEGIT_IP,
    finalAction: 'PASS',
    rttMs: 5,
    msAgo: M5 - 4000,
  });
  await logEvent(
    s2.id,
    'DNS_QUERY',
    'INFO',
    { name: DOMAIN, type: 'A', resolver: 'LEGIT' },
    M5 - 3000,
  );
  await logEvent(
    s2.id,
    'DNS_RESPONSE',
    'INFO',
    { name: DOMAIN, answer: LEGIT_IP, finalAction: 'PASS' },
    M5 - 2800,
  );

  console.log(`    ✓ Сессия 2 (активная): ${s2.id}`);

  // ── итог ─────────────────────────────────────────────────────────────────
  const [sessions, events, queries, policies] = await Promise.all([
    prisma.labSession.count(),
    prisma.event.count(),
    prisma.dnsQuery.count(),
    prisma.mitigationPolicy.count(),
  ]);

  console.log('\n✅  Seed завершён!\n');
  console.log('📊  Статистика:');
  console.log(`    Сессии:   ${sessions}`);
  console.log(`    События:  ${events}`);
  console.log(`    Запросы:  ${queries}`);
  console.log(`    Политики: ${policies}`);
  console.log('\n🔑  ID сессий:');
  console.log(`    Завершённая: ${s1.id}`);
  console.log(`    Активная:    ${s2.id}`);
  console.log('\n🚀  http://localhost:5173\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed ошибка:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
