# DNS Security Platform - Backend

Backend API для симуляции и защиты от DNS Spoofing атак.

## 🛠️ Технологии

- **NestJS** - Node.js framework
- **Prisma ORM** - Database ORM
- **PostgreSQL** - База данных
- **WebSocket** - Real-time обновления
- **Zod** - Валидация данных
- **Swagger** - API документация

## 📦 Установка

### 1. Установите PostgreSQL

Скачайте и установите PostgreSQL с официального сайта: https://www.postgresql.org/download/

### 2. Создайте базу данных

```bash
# Войдите в PostgreSQL
psql -U postgres

# Создайте базу данных
CREATE DATABASE dns_security;

# Выйдите
\q
```

### 3. Установите зависимости

```bash
cd backend
npm install
```

### 4. Настройте .env файл

Создайте файл `.env` в корне папки backend:

```env
DATABASE_URL="postgresql://postgres:ваш_пароль@localhost:5432/dns_security?schema=public"
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:5173
INGEST_API_KEY=dns-security-api-key-change-in-production
```

**ВАЖНО:** Замените `ваш_пароль` на пароль вашего PostgreSQL пользователя!

### 5. Запустите миграции базы данных

```bash
# Сгенерируйте Prisma Client
npm run prisma:generate

# Создайте таблицы в БД
npm run prisma:migrate

# Заполните БД тестовыми данными
npm run prisma:seed
```

### 6. Запустите сервер

```bash
# Development режим (с hot-reload)
npm run start:dev

# Production режим
npm run build
npm run start:prod
```

Сервер запустится на `http://localhost:3000`

## 📚 API Endpoints

После запуска откройте Swagger документацию: **http://localhost:3000/api/docs**

### Simulation (Симуляция атак)

- `POST /api/simulation/start` - Запустить симуляцию
- `POST /api/simulation/:id/stop` - Остановить симуляцию
- `GET /api/simulation/:id` - Получить детали симуляции
- `GET /api/simulation` - Список всех симуляций

### Mitigation (Защита)

- `GET /api/mitigation/config` - Получить конфигурацию защиты
- `PUT /api/mitigation/config` - Обновить конфигурацию
- `GET /api/mitigation/metrics` - Получить метрики безопасности

### Analytics (Аналитика)

- `GET /api/analytics/statistics?days=7` - Статистика атак
- `GET /api/analytics/export?format=csv` - Экспорт отчета

## 🔌 WebSocket Events

WebSocket подключение: `ws://localhost:3000`

**События от сервера:**
- `connected` - Подтверждение подключения
- `simulationUpdate` - Обновление симуляции
- `dnsQuery` - Новый DNS запрос
- `metricsUpdate` - Обновление метрик
- `attackEvent` - Событие атаки

**События на сервер:**
- `ping` - Проверка соединения (ответ: `pong`)

## 🧪 Тестирование API

### Запуск симуляции (пример)

```bash
curl -X POST http://localhost:3000/api/simulation/start \
  -H "Content-Type: application/json" \
  -d '{
    "type": "dns_cache_poisoning",
    "targetDomain": "example.com",
    "spoofedIP": "192.168.1.100",
    "intensity": "medium",
    "duration": 60
  }'
```

### Получение конфигурации защиты

```bash
curl http://localhost:3000/api/mitigation/config
```

## 🗄️ Prisma Studio

Для визуального управления базой данных:

```bash
npm run prisma:studio
```

Откроется браузер на `http://localhost:5555`

## 📝 Полезные команды

```bash
# Форматирование кода
npm run format

# Линтинг
npm run lint

# Пересоздать БД (удалит все данные!)
npm run prisma:migrate -- --reset

# Заново заполнить тестовыми данными
npm run prisma:seed
```

## ⚠️ Troubleshooting

### Ошибка подключения к PostgreSQL

```
Error: P1001: Can't reach database server
```

**Решение:**
1. Проверьте, что PostgreSQL запущен
2. Проверьте правильность пароля в `.env`
3. Убедитесь, что база данных `dns_security` создана

### Ошибка при миграции

```
Error: Migration failed
```

**Решение:**
```bash
# Пересоздайте БД
npm run prisma:migrate -- --reset

# Заново запустите миграции
npm run prisma:migrate
```

### Port уже занят

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Решение:**
1. Измените порт в `.env` (например, на 3001)
2. Или остановите процесс на порту 3000

## 🚀 Production

Для production деплоя:

1. Измените `NODE_ENV=production` в `.env`
2. Сгенерируйте сильный `JWT_SECRET`
3. Настройте правильный `DATABASE_URL`
4. Запустите:

```bash
npm run build
npm run start:prod
```

## 📧 Поддержка

Если возникли проблемы:
1. Проверьте логи сервера
2. Откройте Swagger документацию
3. Проверьте подключение к БД через Prisma Studio