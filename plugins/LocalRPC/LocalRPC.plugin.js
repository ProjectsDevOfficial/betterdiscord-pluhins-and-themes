/**
 * @name LocalRPC
 * @author ProjectsDev
 * @version 0.1 beta
 * @updateurl https://raw.githubusercontent.com/ProjectsDevOfficial/betterdiscord-plugins-and-themes/main/plugins/LocalRPC/LocalRPC.plugin.js
 * @source https://github.com/ProjectsDevOfficial/betterdiscord-plugins-and-themes/tree/main/plugins/LocalRPC
 * @description Локальный кастомный Rich Presence для Discord (BetterDiscord)
 */

module.exports = class CustomRPC {
    constructor() {
        this.settings = {
            enabled: false,
            applicationId: "",
            name: "Кастомный статус",
            details: "Привет из BetterDiscord",
            state: "",
            largeImage: "",
            largeText: "",
            smallImage: "",
            smallText: "",
            showTime: true
        };

        this.interval = null;
    }

    /* ===== МЕТАДАННЫЕ ===== */
    getName() { return "LocalRPC"; }
    getAuthor() { return "ProjectsDev"; }
    getVersion() { return "0.1 beta "; }
    getDescription() { return "Локальный кастомный Rich Presence для BetterDiscord"; }

    /* ===== ЖИЗНЕННЫЙ ЦИКЛ ===== */
    start() {
        this.loadSettings();
        if (this.settings.enabled) this.startRPC();
        BdApi.UI.showToast("LocalRPC загружен", { type: "success" });
    }

    stop() {
        this.stopRPC();
    }

    /* ===== НАСТРОЙКИ ===== */
    loadSettings() {
        this.settings = {
            ...this.settings,
            ...(BdApi.Data.load("LocalRPC", "settings") || {})
        };
    }

    saveSettings() {
        BdApi.Data.save("LocalRPC", "settings", this.settings);
    }

    /* ===== RPC ЛОГИКА ===== */
    startRPC() {
        if (this.interval) return;

        this.startTime = Math.floor(Date.now() / 1000);

        this.interval = setInterval(() => {
            this.sendPresence();
        }, 15000);

        this.sendPresence();
    }

    stopRPC() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }

        const dispatcher = BdApi.Webpack.getModule(m => m.dispatch && m.subscribe);
        dispatcher?.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: null
        });
    }

    sendPresence() {
        const dispatcher = BdApi.Webpack.getModule(m => m.dispatch && m.subscribe);
        if (!dispatcher) return;

        dispatcher.dispatch({
            type: "LOCAL_ACTIVITY_UPDATE",
            activity: {
                application_id: this.settings.applicationId || "0",
                name: this.settings.name,
                details: this.settings.details,
                state: this.settings.state,
                assets: {
                    large_image: this.settings.largeImage || undefined,
                    large_text: this.settings.largeText || undefined,
                    small_image: this.settings.smallImage || undefined,
                    small_text: this.settings.smallText || undefined
                },
                timestamps: this.settings.showTime ? { start: this.startTime } : undefined,
                type: 0
            }
        });
    }

    /* ===== ИНТЕРФЕЙС ===== */
    getSettingsPanel() {
        const panel = document.createElement("div");
        panel.style.padding = "15px";
        
        // Заголовок
        const title = document.createElement("h3");
        title.textContent = "Локальный RPC (Local Activity)";
        title.style.marginTop = "0";
        panel.appendChild(title);

        // Инфо-текст
        const info = document.createElement("div");
        info.textContent = "⚠️ Это локальный статус, видят только вы!";
        info.style.fontSize = "12px";
        info.style.color = "var(--text-muted)";
        info.style.marginBottom = "15px";
        panel.appendChild(info);

        const createInput = (label, key, placeholder = "") => {
            const wrap = document.createElement("div");
            wrap.style.marginBottom = "10px";

            const l = document.createElement("label");
            l.textContent = label;
            l.style.display = "block";
            l.style.fontSize = "14px";
            l.style.marginBottom = "3px";

            const input = document.createElement("input");
            input.value = this.settings[key];
            input.placeholder = placeholder;
            input.style.width = "100%";
            input.style.padding = "6px";
            input.style.border = "1px solid var(--background-modifier-accent)";
            input.style.borderRadius = "3px";
            input.style.backgroundColor = "var(--background-secondary)";
            input.oninput = e => {
                this.settings[key] = e.target.value;
                this.saveSettings();
                if (this.settings.enabled) this.sendPresence();
            };

            wrap.appendChild(l);
            wrap.appendChild(input);
            return wrap;
        };

        // Кнопка вкл/выкл
        const toggle = document.createElement("button");
        toggle.textContent = this.settings.enabled ? "❌ Выключить" : "✅ Включить";
        toggle.style.marginBottom = "15px";
        toggle.style.padding = "8px 16px";
        toggle.style.borderRadius = "4px";
        toggle.style.border = "none";
        toggle.style.backgroundColor = this.settings.enabled ? "var(--button-danger-background)" : "var(--button-positive-background)";
        toggle.style.color = "white";
        toggle.style.cursor = "pointer";
        toggle.onclick = () => {
            this.settings.enabled = !this.settings.enabled;
            this.saveSettings();
            toggle.textContent = this.settings.enabled ? "❌ Выключить" : "✅ Включить";
            toggle.style.backgroundColor = this.settings.enabled ? "var(--button-danger-background)" : "var(--button-positive-background)";
            this.settings.enabled ? this.startRPC() : this.stopRPC();
        };
        panel.appendChild(toggle);

        // Поля ввода
        panel.appendChild(createInput("ID приложения", "applicationId", "Опционально для картинок"));
        panel.appendChild(createInput("Название", "name", "Мой крутой статус"));
        panel.appendChild(createInput("Описание", "details", "Что делаю сейчас"));
        panel.appendChild(createInput("Состояние", "state", "Дополнительная инфа"));
        panel.appendChild(createInput("Ключ большого изображения", "largeImage", "image_large"));
        panel.appendChild(createInput("Текст большого изображения", "largeText", "Подсказка при наведении"));
        panel.appendChild(createInput("Ключ маленького изображения", "smallImage", "image_small"));
        panel.appendChild(createInput("Текст маленького изображения", "smallText", "Ещё подсказка"));

        // Чекбокс времени
        const timeWrap = document.createElement("div");
        timeWrap.style.marginTop = "10px";
        
        const timeCheck = document.createElement("input");
        timeCheck.type = "checkbox";
        timeCheck.checked = this.settings.showTime;
        timeCheck.id = "showTime";
        timeCheck.onchange = e => {
            this.settings.showTime = e.target.checked;
            this.saveSettings();
            if (this.settings.enabled) this.sendPresence();
        };
        
        const timeLabel = document.createElement("label");
        timeLabel.textContent = "Показывать время активности";
        timeLabel.style.marginLeft = "5px";
        timeLabel.htmlFor = "showTime";
        
        timeWrap.appendChild(timeCheck);
        timeWrap.appendChild(timeLabel);
        panel.appendChild(timeWrap);

        return panel;
    }
};