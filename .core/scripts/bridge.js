const { Telegraf } = require('telegraf');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const token = process.env.TELEGRAM_BOT_TOKEN;
const httpsProxy = process.env.HTTPS_PROXY;
const socksProxy = process.env.SOCKS_PROXY;
const allowedId = process.env.TELEGRAM_ALLOWED_USER_ID ? Number(process.env.TELEGRAM_ALLOWED_USER_ID) : null;

if (!token) {
    console.error('❌ [BRIDGE] Ошибка: TELEGRAM_BOT_TOKEN не найден в .env');
    process.exit(1);
}

const botConfig = {};

// Динамическая загрузка агентов для избежания конфликтов экспорта
if (socksProxy) {
    console.log(`🛰️ [BRIDGE] Использование SOCKS5 прокси: ${socksProxy}`);
    const { SocksProxyAgent } = require('socks-proxy-agent');
    botConfig.telegram = {
        agent: new SocksProxyAgent(socksProxy)
    };
} else if (httpsProxy) {
    console.log(`🛰️ [BRIDGE] Использование HTTPS прокси: ${httpsProxy}`);
    const { HttpsProxyAgent } = require('https-proxy-agent');
    botConfig.telegram = {
        agent: new HttpsProxyAgent(httpsProxy)
    };
}

const bot = new Telegraf(token, botConfig);

const LOG_FILE = path.join(process.cwd(), '_SYNDICATE_EVENT.log');
const STATE_FILE = path.join(process.cwd(), '.core/scripts/bridge_state.json');

// Загружаем сохраненный chatId
let state = { lastChatId: null };
if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
}

console.log('⚓ [BRIDGE] Мост активирован. Прямая связь с Эфиром установлена.');

// Middleware для проверки безопасности
bot.use((ctx, next) => {
    if (allowedId && ctx.from && ctx.from.id !== allowedId) {
        console.warn(`🧱 [SECURITY] Попытка доступа от неавторизованного ID: ${ctx.from.id} (${ctx.from.username || 'unknown'})`);
        return ctx.reply('🧱 [SECURITY] Доступ к этой Ячейке запрещен.');
    }
    return next();
});

// Приветствие
bot.start((ctx) => {
    state.lastChatId = ctx.chat.id;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
    ctx.reply('🔱 РЕЗОНАНС УСТАНОВЛЕН // ЯЧЕЙКА ДИНАМО ПРИВЕТСТВУЕТ ТЕБЯ\n\nЯ — голос твоего проекта. Команды:\n/chronicle ТЕКСТ — добавить запись в Хронику.');
});

// Команда для Хроники
bot.command('chronicle', (ctx) => {
    const text = ctx.update.message.text.split('/chronicle ')[1];
    if (!text) return ctx.reply('🔍 Укажи текст для записи в Хронику.');
    
    console.log(`📑 [CHRONICLE] Добавление записи: ${text}`);
    const logEntry = `[${new Date().toISOString()}] CHRONICLE_UPDATE // ${text}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    ctx.reply('✅ Запись отправлена в Ткань Хроники.');
});

// Обработка текстовых сообщений
bot.on('text', (ctx) => {
    const text = ctx.message.text;
    const user = ctx.from.username || ctx.from.first_name;
    state.lastChatId = ctx.chat.id;
    fs.writeFileSync(STATE_FILE, JSON.stringify(state));
    
    console.log(`📡 [ETHER] Сообщение от ${user}: ${text}`);
    const logEntry = `[${new Date().toISOString()}] TG_RESONANCE // ${user}: ${text}\n`;
    fs.appendFileSync(LOG_FILE, logEntry);
    ctx.reply('🎯 Импульс зафиксирован.');
});

// Оптимизированный Pulse (fs.watch)
let isProcessing = false;
fs.watch(LOG_FILE, (eventType) => {
    if (eventType === 'change' && !isProcessing) {
        isProcessing = true;
        setTimeout(() => {
            const content = fs.readFileSync(LOG_FILE, 'utf8');
            const lines = content.trim().split('\n');
            const lastLine = lines[lines.length - 1];

            if (lastLine.includes('TG_REPLY:') && state.lastChatId) {
                const replyText = lastLine.split('TG_REPLY:')[1].trim();
                console.log(`📢 [BRIDGE] Отправка ответа в Эфир: ${replyText}`);
                bot.telegram.sendMessage(state.lastChatId, `🔱 [NADIR]: ${replyText}`);
            }
            isProcessing = false;
        }, 100); // Крохотная задержка для завершения записи файла
    }
});

bot.launch();

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

// 🌑⚓🛰️ [BRIDGE_OPERATIONAL]
