class GameLogic {
    constructor() {
        this.gameState = 'menu';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameTime = 0;
        this.objectives = [];
        this.powerUps = [];
        this.enemies = [];
        this.projectiles = [];
        this.particles = [];
        this.deliveryPoints = [];
        
        this.config = {
            maxEnemies: 5,
            enemySpawnRate: 0.02,
            powerUpSpawnRate: 0.01,
            maxPowerUps: 3,
            levelTimeLimit: 300,
            pointsPerDelivery: 100,
            pointsPerEnemyKill: 50,
            levelMultiplier: 1.5
        };
        
        this.objectiveTypes = {
            DELIVERY: 'delivery',
            SURVIVAL: 'survival',
            ELIMINATION: 'elimination',
            COLLECTION: 'collection'
        };
        
        this.initializeLevel();
    }
    
    initializeLevel() {
        this.objectives = this.generateObjectives();
        this.deliveryPoints = this.generateDeliveryPoints();
        this.enemies = [];
        this.powerUps = [];
        this.projectiles = [];
        this.particles = [];
        this.gameTime = 0;
    }
    
    generateObjectives() {
        const objectives = [];
        
        switch(this.level % 4) {
            case 1:
                objectives.push({
                    id: 'delivery_mission',
                    type: this.objectiveTypes.DELIVERY,
                    description: `Deliver cargo to ${2 + this.level} stations`,
                    target: 2 + this.level,
                    current: 0,
                    completed: false,
                    primary: true
                });
                break;
            case 2:
                objectives.push({
                    id: 'survival_mission',
                    type: this.objectiveTypes.SURVIVAL,
                    description: `Survive for ${60 + this.level * 30} seconds`,
                    target: 60 + this.level * 30,
                    current: 0,
                    completed: false,
                    primary: true
                });
                break;
            case 3:
                objectives.push({
                    id: 'elimination_mission',
                    type: this.objectiveTypes.ELIMINATION,
                    description: `Eliminate ${5 + this.level * 2} enemies`,
                    target: 5 + this.level * 2,
                    current: 0,
                    completed: false,
                    primary: true
                });
                break;
            case 0:
                objectives.push({
                    id: 'collection_mission',
                    type: this.objectiveTypes.COLLECTION,
                    description: `Collect ${3 + this.level} power-ups`,
                    target: 3 + this.level,
                    current: 0,
                    completed: false,
                    primary: true
                });
                break;
        }
        
        objectives.push({
            id: 'no_damage',
            type: 'bonus',
            description: 'Complete without taking damage',
            target: 1,
            current: 0,
            completed: false,
            primary: false,
            bonus: true
        });
        
        return objectives;
    }
    
    generateDeliveryPoints() {
        const points = [];
        const numPoints = 3 + this.level;
        
        for (let i = 0; i < numPoints; i++) {
            points.push({
                id: `delivery_${i}`,
                position: {
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 50,
                    z: (Math.random() - 0.5) * 100
                },
                active: true,
                delivered: false,
                radius: 5
            });
        }
        
        return points;
    }
    
    update(deltaTime, gamePhysics, spacecraft) {
        if (this.gameState !== 'playing') return;
        
        this.gameTime += deltaTime;
        
        this.updateObjectives(deltaTime);
        
        this.spawnEnemies();
        
        this.spawnPowerUps();

        this.updateEnemies(deltaTime, spacecraft);

        this.updateProjectiles(deltaTime);

        this.updateParticles(deltaTime);

        this.checkGameConditions();

        this.handlePhysicsInteractions(gamePhysics, spacecraft);
    }
    
    updateObjectives(deltaTime) {
        this.objectives.forEach(objective => {
            if (objective.completed) return;
            
            switch(objective.type) {
                case this.objectiveTypes.SURVIVAL:
                    objective.current = Math.min(this.gameTime, objective.target);
                    if (objective.current >= objective.target) {
                        objective.completed = true;
                        this.onObjectiveComplete(objective);
                    }
                    break;
            }
        });
    }
    
    spawnEnemies() {
        if (this.enemies.length >= this.config.maxEnemies) return;
        if (Math.random() < this.config.enemySpawnRate * (1 + this.level * 0.1)) {
            this.createEnemy();
        }
    }
    
    createEnemy() {
        const enemy = {
            id: `enemy_${Date.now()}_${Math.random()}`,
            position: {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 100,
                z: (Math.random() - 0.5) * 200
            },
            velocity: {
                x: (Math.random() - 0.5) * 0.1,
                y: (Math.random() - 0.5) * 0.1,
                z: (Math.random() - 0.5) * 0.1
            },
            health: 50 + this.level * 10,
            maxHealth: 50 + this.level * 10,
            damage: 10 + this.level * 2,
            lastShot: 0,
            fireRate: 2000 + Math.random() * 1000,
            ai: {
                state: 'patrol',
                target: null,
                lastStateChange: 0
            }
        };
        
        this.enemies.push(enemy);
    }
    
    spawnPowerUps() {
        if (this.powerUps.length >= this.config.maxPowerUps) return;
        if (Math.random() < this.config.powerUpSpawnRate) {
            this.createPowerUp();
        }
    }
    
    createPowerUp() {
        const types = ['fuel', 'shield', 'speed', 'repair'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        const powerUp = {
            id: `powerup_${Date.now()}_${Math.random()}`,
            type: type,
            position: {
                x: (Math.random() - 0.5) * 150,
                y: (Math.random() - 0.5) * 75,
                z: (Math.random() - 0.5) * 150
            },
            rotation: 0,
            lifetime: 30000,
            collected: false
        };
        
        this.powerUps.push(powerUp);
    }
    
    updateEnemies(deltaTime, spacecraft) {
        this.enemies.forEach((enemy, index) => {
            if (enemy.health <= 0) {
                this.destroyEnemy(index);
                return;
            }
            
            this.updateEnemyAI(enemy, spacecraft, deltaTime);
            
            enemy.position.x += enemy.velocity.x * deltaTime;
            enemy.position.y += enemy.velocity.y * deltaTime;
            enemy.position.z += enemy.velocity.z * deltaTime;
            
            this.keepEnemyInBounds(enemy);
        });
    }
    
    updateEnemyAI(enemy, spacecraft, deltaTime) {
        if (!spacecraft) return;
        
        const distance = this.getDistance(enemy.position, spacecraft.position);
        const now = Date.now();
        
        switch(enemy.ai.state) {
            case 'patrol':
                if (distance < 30) {
                    enemy.ai.state = 'chase';
                    enemy.ai.target = spacecraft.position;
                }
                break;
                
            case 'chase':
                if (distance > 50) {
                    enemy.ai.state = 'patrol';
                } else if (distance < 15) {
                    enemy.ai.state = 'attack';
                }

                const direction = this.normalize({
                    x: spacecraft.position.x - enemy.position.x,
                    y: spacecraft.position.y - enemy.position.y,
                    z: spacecraft.position.z - enemy.position.z
                });
                
                enemy.velocity.x = direction.x * 0.05;
                enemy.velocity.y = direction.y * 0.05;
                enemy.velocity.z = direction.z * 0.05;
                break;
                
            case 'attack':
                if (distance > 20) {
                    enemy.ai.state = 'chase';
                }

                if (now - enemy.lastShot > enemy.fireRate) {
                    this.enemyShoot(enemy, spacecraft);
                    enemy.lastShot = now;
                }
                break;
        }
    }
    
    enemyShoot(enemy, spacecraft) {
        const direction = this.normalize({
            x: spacecraft.position.x - enemy.position.x,
            y: spacecraft.position.y - enemy.position.y,
            z: spacecraft.position.z - enemy.position.z
        });
        
        const projectile = {
            id: `projectile_${Date.now()}_${Math.random()}`,
            position: { ...enemy.position },
            velocity: {
                x: direction.x * 0.3,
                y: direction.y * 0.3,
                z: direction.z * 0.3
            },
            damage: enemy.damage,
            lifetime: 5000,
            owner: 'enemy'
        };
        
        this.projectiles.push(projectile);
    }
    
    updateProjectiles(deltaTime) {
        this.projectiles.forEach((projectile, index) => {
            projectile.position.x += projectile.velocity.x * deltaTime;
            projectile.position.y += projectile.velocity.y * deltaTime;
            projectile.position.z += projectile.velocity.z * deltaTime;
            
            projectile.lifetime -= deltaTime;
            
            if (projectile.lifetime <= 0) {
                this.projectiles.splice(index, 1);
            }
        });
    }
    
    updateParticles(deltaTime) {
        this.particles.forEach((particle, index) => {
            particle.position.x += particle.velocity.x * deltaTime;
            particle.position.y += particle.velocity.y * deltaTime;
            particle.position.z += particle.velocity.z * deltaTime;
            
            particle.lifetime -= deltaTime;
            particle.scale *= 0.999;
            
            if (particle.lifetime <= 0 || particle.scale < 0.01) {
                this.particles.splice(index, 1);
            }
        });
    }
    
    handlePhysicsInteractions(gamePhysics, spacecraft) {
        gamePhysics.checkDelivery = (spacecraft) => {
            this.deliveryPoints.forEach(point => {
                if (!point.active || point.delivered) return;
                
                const distance = this.getDistance(spacecraft.position, point.position);
                if (distance < point.radius) {
                    this.handleDelivery(point);
                }
            });
        };

        gamePhysics.checkPowerUpCollisions = (spacecraft) => {
            this.powerUps.forEach((powerUp, index) => {
                if (powerUp.collected) return;
                
                const distance = this.getDistance(spacecraft.position, powerUp.position);
                if (distance < 3) {
                    this.collectPowerUp(powerUp, gamePhysics);
                    this.powerUps.splice(index, 1);
                }
            });
        };
        
        gamePhysics.checkCollisions = (spacecraft) => {
            this.projectiles.forEach((projectile, index) => {
                if (projectile.owner === 'enemy') {
                    const distance = this.getDistance(spacecraft.position, projectile.position);
                    if (distance < 2) {
                        this.handlePlayerHit(projectile.damage, gamePhysics);
                        this.projectiles.splice(index, 1);
                    }
                }
            });
            
            this.enemies.forEach(enemy => {
                const distance = this.getDistance(spacecraft.position, enemy.position);
                if (distance < 3) {
                    this.handlePlayerHit(enemy.damage, gamePhysics);
                    enemy.health -= 25;
                }
            });
        };
    }
    
    handleDelivery(point) {
        point.delivered = true;
        point.active = false;
        
        this.score += this.config.pointsPerDelivery * this.level;
        this.createParticleEffect(point.position, 'delivery');
        
        const deliveryObjective = this.objectives.find(obj => obj.type === this.objectiveTypes.DELIVERY);
        if (deliveryObjective && !deliveryObjective.completed) {
            deliveryObjective.current++;
            if (deliveryObjective.current >= deliveryObjective.target) {
                deliveryObjective.completed = true;
                this.onObjectiveComplete(deliveryObjective);
            }
        }
    }
    
    collectPowerUp(powerUp, gamePhysics) {
        powerUp.collected = true;
        
        switch(powerUp.type) {
            case 'fuel':
                gamePhysics.fuel = Math.min(100, gamePhysics.fuel + 30);
                break;
            case 'shield':
                gamePhysics.shieldEnergy = Math.min(100, gamePhysics.shieldEnergy + 50);
                break;
            case 'speed':
                gamePhysics.maxSpeed *= 1.5;
                setTimeout(() => gamePhysics.maxSpeed /= 1.5, 10000);
                break;
            case 'repair':
                this.lives = Math.min(3, this.lives + 1);
                break;
        }
        
        this.createParticleEffect(powerUp.position, 'powerup');
        
        const collectionObjective = this.objectives.find(obj => obj.type === this.objectiveTypes.COLLECTION);
        if (collectionObjective && !collectionObjective.completed) {
            collectionObjective.current++;
            if (collectionObjective.current >= collectionObjective.target) {
                collectionObjective.completed = true;
                this.onObjectiveComplete(collectionObjective);
            }
        }
    }
    
    handlePlayerHit(damage, gamePhysics) {
        if (gamePhysics.shieldActive && gamePhysics.shieldEnergy > 0) {
            gamePhysics.shieldEnergy -= damage;
            if (gamePhysics.shieldEnergy <= 0) {
                gamePhysics.shieldActive = false;
            }
        } else {
            this.lives--;
            if (this.lives <= 0) {
                this.gameState = 'gameOver';
            }
        }
        
        const bonusObjective = this.objectives.find(obj => obj.bonus && obj.id === 'no_damage');
        if (bonusObjective) {
            bonusObjective.completed = false;
        }
    }
    
    destroyEnemy(index) {
        const enemy = this.enemies[index];
        this.score += this.config.pointsPerEnemyKill * this.level;
        this.createParticleEffect(enemy.position, 'explosion');
        this.enemies.splice(index, 1);
        
        const eliminationObjective = this.objectives.find(obj => obj.type === this.objectiveTypes.ELIMINATION);
        if (eliminationObjective && !eliminationObjective.completed) {
            eliminationObjective.current++;
            if (eliminationObjective.current >= eliminationObjective.target) {
                eliminationObjective.completed = true;
                this.onObjectiveComplete(eliminationObjective);
            }
        }
    }
    
    createParticleEffect(position, type) {
        const particleCount = type === 'explosion' ? 10 : 5;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = {
                position: { ...position },
                velocity: {
                    x: (Math.random() - 0.5) * 0.2,
                    y: (Math.random() - 0.5) * 0.2,
                    z: (Math.random() - 0.5) * 0.2
                },
                lifetime: 1000 + Math.random() * 2000,
                scale: 0.5 + Math.random() * 0.5,
                type: type
            };
            
            this.particles.push(particle);
        }
    }
    
    onObjectiveComplete(objective) {
        if (objective.primary) {
            this.score += 500 * this.level;
        } else {
            this.score += 200 * this.level;
        }
    }
    
    checkGameConditions() {
        const primaryObjectives = this.objectives.filter(obj => obj.primary);
        const completedPrimary = primaryObjectives.filter(obj => obj.completed);
        
        if (completedPrimary.length === primaryObjectives.length) {
            this.levelComplete();
        }

        if (this.gameTime > this.config.levelTimeLimit * 1000) {
            this.gameState = 'gameOver';
        }
    }
    
    levelComplete() {
        this.level++;
        this.score += 1000 * this.level;
        
        const bonusObjectives = this.objectives.filter(obj => obj.bonus && obj.completed);
        bonusObjectives.forEach(obj => {
            this.score += 300 * this.level;
        });
        
        this.gameState = 'victory';
    }
    
    getDistance(pos1, pos2) {
        const dx = pos1.x - pos2.x;
        const dy = pos1.y - pos2.y;
        const dz = pos1.z - pos2.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    
    normalize(vector) {
        const length = Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: vector.x / length,
            y: vector.y / length,
            z: vector.z / length
        };
    }
    
    keepEnemyInBounds(enemy) {
        const bounds = 150;
        if (Math.abs(enemy.position.x) > bounds) {
            enemy.velocity.x *= -1;
        }
        if (Math.abs(enemy.position.y) > bounds) {
            enemy.velocity.y *= -1;
        }
        if (Math.abs(enemy.position.z) > bounds) {
            enemy.velocity.z *= -1;
        }
    }
    
    startGame() {
        this.gameState = 'playing';
        this.initializeLevel();
    }
    
    pauseGame() {
        this.gameState = 'paused';
    }
    
    resumeGame() {
        this.gameState = 'playing';
    }
    
    resetGame() {
        this.gameState = 'menu';
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.gameTime = 0;
        this.initializeLevel();
    }
    
    nextLevel() {
        this.initializeLevel();
        this.gameState = 'playing';
    }
    
    getGameState() {
        return {
            state: this.gameState,
            score: this.score,
            level: this.level,
            lives: this.lives,
            gameTime: this.gameTime,
            objectives: this.objectives,
            enemies: this.enemies.length,
            powerUps: this.powerUps.length
        };
    }
    
    getObjectivesStatus() {
        return this.objectives.map(obj => ({
            description: obj.description,
            progress: `${obj.current}/${obj.target}`,
            completed: obj.completed,
            primary: obj.primary,
            bonus: obj.bonus || false
        }));
    }
}