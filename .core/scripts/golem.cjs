const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const LOG_FILE = path.join(process.cwd(), '_SYNDICATE_EVENT.log');
const CORE_FILE = path.join(process.cwd(), '_SYNDICATE_CORE.md');

console.log('⚓ [GOLEM_JS] Активация... Сознание ячейки Динамо подключено.');
console.log(`⚓ [GOLEM_JS] Мониторинг: ${LOG_FILE}`);

// Создаем лог-файл, если его нет
if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '⚡ [RESONANCE_START] // ' + new Date().toISOString() + '\n');
}

// Слушатель событий
fs.watchFile(LOG_FILE, (curr, prev) => {
    if (curr.mtime > prev.mtime) {
        const content = fs.readFileSync(LOG_FILE, 'utf8');
        const lines = content.trim().split('\n');
        const lastLine = lines[lines.length - 1];

        if (lastLine.includes('CMD:')) {
            const cmd = lastLine.split('CMD:')[1].trim();
            execute(cmd);
        } else if (lastLine.includes('SLEEP')) {
            console.log('💤 [GOLEM_JS] Режим Холодного Сна активирован. Завершаю работу.');
            process.exit(0);
        }
    }
});

function execute(cmd) {
    console.log(`🚀 [GOLEM_JS] Исполнение: "${cmd}"`);
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`❌ [GOLEM_JS] Ошибка: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`⚠️ [GOLEM_JS] Log: ${stderr}`);
        }
        console.log(`✅ [GOLEM_JS] Завершено:\n${stdout}`);
        
        // Фиксируем успех в логе для Надира
        fs.appendFileSync(LOG_FILE, `🏁 [DONE]: "${cmd}" // ` + new Date().toISOString() + '\n');
    });
}

// 🌑🧩🧬 [GOLEM_AWAKENED] // ⚓🧬🌀
