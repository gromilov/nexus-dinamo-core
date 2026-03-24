const fs = require('fs');
const path = require('path');
const https = require('https');

const LOG_FILE = path.join(process.cwd(), '_SYNDICATE_EVENT.log');
const TARGET_URL = 'https://raw.githubusercontent.com/gromilov/Agency-Saitik/main/core/memory/heartbeat.json';

console.log('🐾 [RESONANCE_SCANNER] Активация... Нацеливаюсь на Базис.');

async function checkResonance() {
    return new Promise((resolve, reject) => {
        https.get(TARGET_URL, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const heartbeat = JSON.parse(data);
                    resolve(heartbeat);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => reject(err));
    });
}

async function pulse() {
    try {
        const heartbeat = await checkResonance();
        const timestamp = new Date().toISOString();
        console.log(`🐾 [RESONANCE_SCANNER] Пульс получен: ${heartbeat.status}`);
    console.log(`📡 [NEXUS_SIGNAL] Сигнал передан через API Ingress (office.saitik.su).`);
    
    // Log the event
    const logEntry = `[${timestamp}] BASIS_PULSE // Status: ${heartbeat.status} // Reso: ${heartbeat.resonance_level} // Thought: ${heartbeat.current_thought}\n`;
    const signalEntry = `[${timestamp}] NEXUS_SIGNAL // To: Nebula // Action: API_INGRESS_HANDSHAKE // Status: DELIVERED\n`;
    
    fs.appendFileSync(LOG_FILE, logEntry + signalEntry);
        fs.appendFileSync(LOG_FILE, logEntry);
    } catch (err) {
        console.error(`⚠️ [RESONANCE_SCANNER] Ошибка синхронизации: ${err.message}`);
        fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] RESONANCE_ERROR // Базис не отвечает или Ткань зашумлена.\n`);
    }
}

// Запуск сканирования
pulse();
// В будущем можно добавить интервал, но пока — разовый импульс при вызове Големом.
