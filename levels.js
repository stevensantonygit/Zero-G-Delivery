const LEVELS = [
    {
        id: 'tutorial',
        name: 'Training Mission',
        description: 'Learn the basics of zero-g flight in a safe environment.',
        timeLimit: 180,
        asteroidCount: 10,
        asteroidSize: { min: 0.5, max: 1.0 },
        deliveryPoint: { x: 30, y: 15, z: -20 },
        startPosition: { x: 0, y: 0, z: 0 },
        startingFuel: 100,
        fuelRegenRate: 0.03,
        maxSpeed: 0.35,
        unlockMessage: 'Congratulations on completing your training! You are now ready for real missions.'
    },
    {
        id: 'asteroid-run',
        name: 'Asteroid Run',
        description: 'Navigate through a dense asteroid field to deliver critical supplies.',
        timeLimit: 120,
        asteroidCount: 40,
        asteroidSize: { min: 0.5, max: 1.5 },
        deliveryPoint: { x: 50, y: 30, z: -40 },
        startPosition: { x: 0, y: 0, z: 0 },
        startingFuel: 100,
        fuelRegenRate: 0.02,
        maxSpeed: 0.3,
        unlockMessage: 'Well done! You\'ve proved your skills in navigating hazardous environments.'
    },
    {
        id: 'ice-fields',
        name: 'Ice Fields',
        description: 'Deliver research equipment to a station hidden deep in the icy void.',
        timeLimit: 150,
        asteroidCount: 30,
        asteroidSize: { min: 1.0, max: 2.5 },
        deliveryPoint: { x: -60, y: -20, z: 70 },
        startPosition: { x: 0, y: 0, z: 0 },
        startingFuel: 90,
        fuelRegenRate: 0.015,
        maxSpeed: 0.3,
        specialEnvironment: 'ice',
        unlockMessage: 'Excellent delivery through the treacherous ice fields!'
    },
    {
        id: 'solar-winds',
        name: 'Solar Winds',
        description: 'Battle against powerful solar winds while making an urgent delivery.',
        timeLimit: 100,
        asteroidCount: 25,
        asteroidSize: { min: 0.5, max: 1.5 },
        deliveryPoint: { x: 20, y: 50, z: -80 },
        startPosition: { x: 0, y: 0, z: 0 },
        startingFuel: 80,
        fuelRegenRate: 0.01,
        maxSpeed: 0.25,
        environmentEffects: {
            solarWind: { direction: { x: 0.5, y: 0.2, z: -0.3 }, strength: 0.002 }
        },
        unlockMessage: 'Outstanding navigation against the solar winds!'
    },
    {
        id: 'nebula-dive',
        name: 'Nebula Dive',
        description: 'Limited visibility and electromagnetic interference make this delivery extremely challenging.',
        timeLimit: 180,
        asteroidCount: 50,
        asteroidSize: { min: 0.3, max: 2.0 },
        deliveryPoint: { x: -40, y: -40, z: -40 },
        startPosition: { x: 0, y: 0, z: 0 },
        startingFuel: 75,
        fuelRegenRate: 0.005,
        maxSpeed: 0.2,
        environmentEffects: {
            fogDensity: 0.02,
            navigationInterference: 0.3
        },
        unlockMessage: 'Remarkable! You\'ve mastered delivery in the most challenging conditions.'
    }
];

let playerProgress = {
    currentLevel: 'tutorial',
    unlockedLevels: ['tutorial'],
    completedLevels: [],
    highScores: {}
};

function loadPlayerProgress() {
    const savedProgress = localStorage.getItem('zeroGDeliveryProgress');
    if (savedProgress) {
        try {
            playerProgress = JSON.parse(savedProgress);
        } catch (e) {
            console.error('Failed to load player progress:', e);
        }
    }
}

function savePlayerProgress() {
    localStorage.setItem('zeroGDeliveryProgress', JSON.stringify(playerProgress));
}

function getLevelById(levelId) {
    return LEVELS.find(level => level.id === levelId) || LEVELS[0];
}

function isLevelUnlocked(levelId) {
    return playerProgress.unlockedLevels.includes(levelId);
}

function completeLevel(levelId, score) {
    if (!playerProgress.completedLevels.includes(levelId)) {
        playerProgress.completedLevels.push(levelId);
    }
    
    if (!playerProgress.highScores[levelId] || score > playerProgress.highScores[levelId]) {
        playerProgress.highScores[levelId] = score;
    }
    
    const currentLevelIndex = LEVELS.findIndex(level => level.id === levelId);
    if (currentLevelIndex < LEVELS.length - 1) {
        const nextLevelId = LEVELS[currentLevelIndex + 1].id;
        if (!playerProgress.unlockedLevels.includes(nextLevelId)) {
            playerProgress.unlockedLevels.push(nextLevelId);
        }
    }
    
    savePlayerProgress();
    return getLevelById(levelId).unlockMessage;
}

function initializeLevelSystem() {
    loadPlayerProgress();
    return playerProgress;
}

export {
    LEVELS,
    initializeLevelSystem,
    getLevelById,
    isLevelUnlocked,
    completeLevel,
    playerProgress
};