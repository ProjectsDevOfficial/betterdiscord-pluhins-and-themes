/**
 * @name LocalRPC
 * @author ProjectsDev
 * @version 0.2 beta
 * @updateurl https://raw.githubusercontent.com/ProjectsDevOfficial/betterdiscord-plugins-and-themes/main/plugins/LocalRPC/LocalRPC.plugin.js
 * @source https://github.com/ProjectsDevOfficial/betterdiscord-plugins-and-themes/tree/main/plugins/LocalRPC
 * @description Local custom Rich Presence for Discord (BetterDiscord)
 */

module.exports = class CustomRPC {
    constructor() {
        this.currentLanguage = 'en'; // 'en' or 'ru'
        this.translations = {
            en: {
                pluginName: "LocalRPC",
                pluginDescription: "Local custom Rich Presence for BetterDiscord",
                toastLoaded: "LocalRPC loaded",
                settingsTitle: "Local RPC (Local Activity)",
                warning: "⚠️ This is a local status, only you can see it!",
                enableButton: "✅ Enable",
                disableButton: "❌ Disable",
                appId: "Application ID",
                appIdPlaceholder: "Optional for images",
                name: "Name",
                namePlaceholder: "My cool status",
                details: "Details",
                detailsPlaceholder: "What I'm doing now",
                state: "State",
                statePlaceholder: "Additional info",
                largeImageKey: "Large image key",
                largeImageText: "Large image text",
                largeImageTextPlaceholder: "Tooltip on hover",
                smallImageKey: "Small image key",
                smallImageText: "Small image text",
                smallImageTextPlaceholder: "Another tooltip",
                showTime: "Show activity time",
                defaultName: "Custom Status",
                defaultDetails: "Hello from BetterDiscord"
            },
            ru: {
                pluginName: "LocalRPC",
                pluginDescription: "Локальный кастомный Rich Presence для BetterDiscord",
                toastLoaded: "LocalRPC загружен",
                settingsTitle: "Локальный RPC (Local Activity)",
                warning: "⚠️ Это локальный статус, видят только вы!",
                enableButton: "✅ Включить",
                disableButton: "❌ Выключить",
                appId: "ID приложения",
                appIdPlaceholder: "Опционально для картинок",
                name: "Название",
                namePlaceholder: "Мой крутой статус",
                details: "Описание",
                detailsPlaceholder: "Что делаю сейчас",
                state: "Состояние",
                statePlaceholder: "Дополнительная инфа",
                largeImageKey: "Ключ большого изображения",
                largeImageText: "Текст большого изображения",
                largeImageTextPlaceholder: "Подсказка при наведении",
                smallImageKey: "Ключ маленького изображения",
                smallImageText: "Текст маленького изображения",
                smallImageTextPlaceholder: "Ещё подсказка",
                showTime: "Показывать время активности",
                defaultName: "Кастомный статус",
                defaultDetails: "Привет из BetterDiscord"
            }
        };

        this.settings = {
            enabled: false,
            applicationId: "",
            name: this.translations.en.defaultName,
            details: this.translations.en.defaultDetails,
            state: "",
            largeImage: "",
            largeText: "",
            smallImage: "",
            smallText: "",
            showTime: true,
            language: 'en'
        };

        this.interval = null;
    }

    /* ===== МЕТАДАННЫЕ ===== */
    getName() { return "LocalRPC"; }
    getAuthor() { return "ProjectsDev"; }
    getVersion() { return "0.2 beta"; }
    getDescription() { return this.translations[this.currentLanguage].pluginDescription; }

    /* ===== ЖИЗНЕННЫЙ ЦИКЛ ===== */
    start() {
        this.loadSettings();
        this.currentLanguage = this.settings.language || 'en';
        if (this.settings.enabled) this.startRPC();
        BdApi.UI.showToast(this.translations[this.currentLanguage].toastLoaded, { type: "success" });
    }

    stop() {
        this.stopRPC();
    }

    /* ===== НАСТРОЙКИ ===== */
    loadSettings() {
        const saved = BdApi.Data.load("LocalRPC", "settings") || {};
        this.settings = { ...this.settings, ...saved };
        
        // Update default values based on language
        if (!saved.name) {
            this.settings.name = this.translations[this.settings.language || 'en'].defaultName;
        }
        if (!saved.details) {
            this.settings.details = this.translations[this.settings.language || 'en'].defaultDetails;
        }
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
        const t = this.translations[this.currentLanguage];
        const panel = document.createElement("div");
        panel.style.padding = "15px";
        
        // Заголовок
        const title = document.createElement("h3");
        title.textContent = t.settingsTitle;
        title.style.marginTop = "0";
        panel.appendChild(title);

        // Языковой переключатель
        const langContainer = document.createElement("div");
        langContainer.style.marginBottom = "15px";
        langContainer.style.display = "flex";
        langContainer.style.alignItems = "center";
        langContainer.style.gap = "10px";
        
        const langLabel = document.createElement("span");
        langLabel.textContent = "Language / Язык:";
        langLabel.style.fontSize = "14px";
        
        const langSelect = document.createElement("select");
        langSelect.style.padding = "5px";
        langSelect.style.borderRadius = "3px";
        langSelect.style.backgroundColor = "var(--background-secondary)";
        langSelect.style.border = "1px solid var(--background-modifier-accent)";
        
        const optionEn = document.createElement("option");
        optionEn.value = "en";
        optionEn.textContent = "English";
        optionEn.selected = this.currentLanguage === 'en';
        
        const optionRu = document.createElement("option");
        optionRu.value = "ru";
        optionRu.textContent = "Русский";
        optionRu.selected = this.currentLanguage === 'ru';
        
        langSelect.appendChild(optionEn);
        langSelect.appendChild(optionRu);
        
        langSelect.onchange = (e) => {
            this.currentLanguage = e.target.value;
            this.settings.language = e.target.value;
            this.saveSettings();
            
            // Обновляем значения по умолчанию при смене языка, только если они не были изменены пользователем
            if (this.settings.name === this.translations[this.currentLanguage === 'en' ? 'ru' : 'en'].defaultName) {
                this.settings.name = t.defaultName;
            }
            if (this.settings.details === this.translations[this.currentLanguage === 'en' ? 'ru' : 'en'].defaultDetails) {
                this.settings.details = t.defaultDetails;
            }
            
            this.saveSettings();
            
            // Перезагружаем панель настроек
            const settingsPanel = this.getSettingsPanel();
            panel.parentNode?.replaceChild(settingsPanel, panel);
        };
        
        langContainer.appendChild(langLabel);
        langContainer.appendChild(langSelect);
        panel.appendChild(langContainer);

        // Инфо-текст
        const info = document.createElement("div");
        info.textContent = t.warning;
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
        toggle.textContent = this.settings.enabled ? t.disableButton : t.enableButton;
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
            toggle.textContent = this.settings.enabled ? t.disableButton : t.enableButton;
            toggle.style.backgroundColor = this.settings.enabled ? "var(--button-danger-background)" : "var(--button-positive-background)";
            this.settings.enabled ? this.startRPC() : this.stopRPC();
        };
        panel.appendChild(toggle);

        // Поля ввода
        panel.appendChild(createInput(t.appId, "applicationId", t.appIdPlaceholder));
        panel.appendChild(createInput(t.name, "name", t.namePlaceholder));
        panel.appendChild(createInput(t.details, "details", t.detailsPlaceholder));
        panel.appendChild(createInput(t.state, "state", t.statePlaceholder));
        panel.appendChild(createInput(t.largeImageKey, "largeImage", "image_large"));
        panel.appendChild(createInput(t.largeImageText, "largeText", t.largeImageTextPlaceholder));
        panel.appendChild(createInput(t.smallImageKey, "smallImage", "image_small"));
        panel.appendChild(createInput(t.smallImageText, "smallText", t.smallImageTextPlaceholder));

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
        timeLabel.textContent = t.showTime;
        timeLabel.style.marginLeft = "5px";
        timeLabel.htmlFor = "showTime";
        
        timeWrap.appendChild(timeCheck);
        timeWrap.appendChild(timeLabel);
        panel.appendChild(timeWrap);

        return panel;
    }
};
