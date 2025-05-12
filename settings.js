const DEFAULT_SETTINGS = {
    graphics: {
        quality: 'medium',
        particles: true,
        shadows: true,
        postProcessing: true,
        fov: 75,
        cameraDistance: 10,
    },
    
    audio: {
        masterVolume: 0.8,
        musicVolume: 0.7,
        sfxVolume: 0.9,
        uiSounds: true,
    },
    
    controls: {
        invertY: false,
        mouseSensitivity: 0.5,
        keyboardSensitivity: 0.5,
        controllerSensitivity: 0.5,
        vibration: true,
        controlScheme: 'default',
        keyBindings: {
            forward: 'KeyW',
            backward: 'KeyS',
            left: 'KeyA',
            right: 'KeyD',
            up: 'KeyR',
            down: 'KeyF',
            rollLeft: 'KeyQ',
            rollRight: 'KeyE',
            fullStop: 'Space',
            boost: 'ShiftLeft',
        }
    },

    gameplay: {
        difficulty: 'normal',
        tutorialEnabled: true,
        showTrajectory: true,
        showWarnings: true,
        autoStabilize: false,
    },
    
    // Accessibility settings
    accessibility: {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        colorblindMode: 'off',
    }
};

let currentSettings = {};

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('zeroGDeliverySettings');
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            currentSettings = mergeDeep(DEFAULT_SETTINGS, parsed);
        } else {
            currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
        currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
    
    return currentSettings;
}

function saveSettings() {
    try {
        localStorage.setItem('zeroGDeliverySettings', JSON.stringify(currentSettings));
        return true;
    } catch (e) {
        console.error('Failed to save settings:', e);
        return false;
    }
}

function resetSettings() {
    currentSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    saveSettings();
    return currentSettings;
}

function updateSetting(category, setting, value) {
    if (currentSettings[category] && setting in currentSettings[category]) {
        currentSettings[category][setting] = value;
        saveSettings();
        return true;
    }
    return false;
}

function getSettings() {
    return currentSettings;
}

function applySettings(renderer, scene, camera, audio) {
    if (renderer) {
        switch (currentSettings.graphics.quality) {
            case 'low':
                renderer.setPixelRatio(window.devicePixelRatio * 0.5);
                break;
            case 'medium':
                renderer.setPixelRatio(window.devicePixelRatio * 0.75);
                break;
            case 'high':
                renderer.setPixelRatio(window.devicePixelRatio);
                break;
        }

        renderer.shadowMap.enabled = currentSettings.graphics.shadows;
    }
    
    if (camera) {
        camera.fov = currentSettings.graphics.fov;
        camera.updateProjectionMatrix();
    }
    
    if (audio) {
        audio.setMasterVolume(currentSettings.audio.masterVolume);
    }
    
    document.querySelectorAll('#hud, #controls, #mission-info').forEach(el => {
        el.style.opacity = currentSettings.gameplay.hudOpacity;
    });
    
    document.body.classList.toggle('high-contrast', currentSettings.accessibility.highContrast);
    document.body.classList.toggle('large-text', currentSettings.accessibility.largeText);
    document.body.classList.toggle('reduced-motion', currentSettings.accessibility.reducedMotion);
    document.body.setAttribute('data-colorblind-mode', currentSettings.accessibility.colorblindMode);
    
    return currentSettings;
}

function mergeDeep(target, source) {
    const output = Object.assign({}, target);
    
    if (isObject(target) && isObject(source)) {
        Object.keys(source).forEach(key => {
            if (isObject(source[key])) {
                if (!(key in target)) {
                    Object.assign(output, { [key]: source[key] });
                } else {
                    output[key] = mergeDeep(target[key], source[key]);
                }
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    
    return output;
}

function isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
}

function createSettingsUI(containerId, onSave) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    const sections = [
        { id: 'graphics', title: 'Graphics' },
        { id: 'audio', title: 'Audio' },
        { id: 'controls', title: 'Controls' },
        { id: 'gameplay', title: 'Gameplay' },
        { id: 'accessibility', title: 'Accessibility' }
    ];
    
    const tabsContainer = document.createElement('div');
    tabsContainer.className = 'settings-tabs';
    container.appendChild(tabsContainer);
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'settings-content';
    container.appendChild(contentContainer);
    
    sections.forEach((section, index) => {
        const tab = document.createElement('div');
        tab.className = 'settings-tab';
        tab.textContent = section.title;
        tab.dataset.section = section.id;
        tab.addEventListener('click', () => {
            document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            document.querySelectorAll('.settings-section').forEach(s => s.style.display = 'none');
            document.getElementById(`settings-section-${section.id}`).style.display = 'block';
        });
        
        tabsContainer.appendChild(tab);
        
        const sectionEl = document.createElement('div');
        sectionEl.className = 'settings-section';
        sectionEl.id = `settings-section-${section.id}`;
        sectionEl.style.display = index === 0 ? 'block' : 'none';

        createSettingsForSection(sectionEl, section.id);
        
        contentContainer.appendChild(sectionEl);
    });
    
    tabsContainer.querySelector('.settings-tab').classList.add('active');
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'settings-buttons';
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.addEventListener('click', () => {
        saveSettings();
        if (typeof onSave === 'function') {
            onSave(currentSettings);
        }
    });
    
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Reset to Default';
    resetButton.addEventListener('click', () => {
        resetSettings();
        createSettingsUI(containerId, onSave);
    });
    
    buttonsContainer.appendChild(saveButton);
    buttonsContainer.appendChild(resetButton);
    
    container.appendChild(buttonsContainer);
}

function createSettingsForSection(container, sectionId) {
    const section = currentSettings[sectionId];
    if (!section) return;
    
    Object.entries(section).forEach(([key, value]) => {
        if (typeof value === 'object' && !Array.isArray(value)) {
            if (key === 'keyBindings') {
                createKeyBindingsEditor(container, value);
            }
            return;
        }
        
        const label = document.createElement('label');
        label.textContent = formatSettingName(key);
        
        let input;

        if (typeof value === 'boolean') {
            input = document.createElement('input');
            input.type = 'checkbox';
            input.checked = value;
            input.addEventListener('change', () => {
                currentSettings[sectionId][key] = input.checked;
            });
        } else if (typeof value === 'number') {
            input = document.createElement('input');
            input.type = 'range';
            input.min = 0;
            input.max = 1;
            input.step = 0.01;
            input.value = value;

            const valueDisplay = document.createElement('span');
            valueDisplay.textContent = Math.round(value * 100) + '%';
            
            input.addEventListener('input', () => {
                valueDisplay.textContent = Math.round(input.value * 100) + '%';
                currentSettings[sectionId][key] = parseFloat(input.value);
            });
            
            label.appendChild(input);
            label.appendChild(valueDisplay);
        } else if (key.toLowerCase().includes('quality') || key === 'difficulty' || key === 'colorblindMode') {
            input = document.createElement('select');
            
            if (key === 'quality') {
                ['low', 'medium', 'high'].forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option;
                    optionEl.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                    optionEl.selected = value === option;
                    input.appendChild(optionEl);
                });
            } else if (key === 'difficulty') {
                ['easy', 'normal', 'hard'].forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option;
                    optionEl.textContent = option.charAt(0).toUpperCase() + option.slice(1);
                    optionEl.selected = value === option;
                    input.appendChild(optionEl);
                });
            } else if (key === 'colorblindMode') {
                ['off', 'protanopia', 'deuteranopia', 'tritanopia'].forEach(option => {
                    const optionEl = document.createElement('option');
                    optionEl.value = option;
                    optionEl.textContent = option === 'off' ? 'None' : option.charAt(0).toUpperCase() + option.slice(1);
                    optionEl.selected = value === option;
                    input.appendChild(optionEl);
                });
            }
            
            input.addEventListener('change', () => {
                currentSettings[sectionId][key] = input.value;
            });
        } else {
            input = document.createElement('input');
            input.type = 'text';
            input.value = value;
            input.addEventListener('change', () => {
                currentSettings[sectionId][key] = input.value;
            });
        }
        
        const settingContainer = document.createElement('div');
        settingContainer.className = 'setting-item';
        
        if (input !== label.lastChild) {
            settingContainer.appendChild(label);
            settingContainer.appendChild(input);
        } else {
            settingContainer.appendChild(label);
        }
        
        container.appendChild(settingContainer);
    });
}
