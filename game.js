class ZeroGDelivery {
    constructor() {
        this.gameActive = false;
        this.spacecraft = null;
        this.velocity = new THREE.Vector3();
        this.angularVelocity = new THREE.Vector3();
        this.thrusters = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false,
            rollLeft: false,
            rollRight: false
        };
        this.fuel = 100;
        this.fuelConsumptionRate = 0.05;
        this.fuelRegenRate = 0.02;
        this.thrusterPower = 0.005;
        this.maxSpeed = 0.3;
        this.angularThrusterPower = 0.0015;
        this.dampingFactor = 0.995;
        this.missionTime = 120;
        this.deliveryPoint = null;
        this.deliveryMarker = null;
        this.asteroids = [];
        this.stars = null;
        this.lastTime = 0;
        this.difficulty = 'normal';
        this.missionType = 'delivery';
        this.score = 0;
        this.powerups = [];
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.setupLights();
        
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);
        this.animate = this.animate.bind(this);
        
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
        window.addEventListener('resize', this.onWindowResize);

        document.getElementById('start-button').addEventListener('click', () => this.startGame());

        this.sounds = {
            thruster: new Audio('sounds/thruster.mp3'),
            collision: new Audio('sounds/collision.mp3'),
            success: new Audio('sounds/success.mp3'),
            alarm: new Audio('sounds/alarm.mp3'),
            powerup: new Audio('sounds/powerup.mp3')
        };
        
        this.bgMusic = new Audio('sounds/space_ambient.mp3');
        this.bgMusic.loop = true;
        this.bgMusic.volume = 0.5;
    }
    
    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x333333);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 200, 100);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        const pointLight = new THREE.PointLight(0x0088ff, 1, 50);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }
    
    createSpacecraft() {
        const spacecraftGroup = new THREE.Group();
        
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0x888888, shininess: 100 });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        spacecraftGroup.add(body);
        
        const wingGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
        const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
        const wings = new THREE.Mesh(wingGeometry, wingMaterial);
        wings.position.y = -0.2;
        spacecraftGroup.add(wings);
        
        const cockpitGeometry = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const cockpitMaterial = new THREE.MeshPhongMaterial({ color: 0x44aaff, transparent: true, opacity: 0.7 });
        const cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
        cockpit.position.z = 0.5;
        cockpit.rotation.x = Math.PI;
        spacecraftGroup.add(cockpit);
        
        const thrusterGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8);
        const thrusterMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
        
        const thrusterLeft = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
        thrusterLeft.position.set(-0.8, 0, -1);
        thrusterLeft.rotation.x = Math.PI / 2;
        spacecraftGroup.add(thrusterLeft);
        
        const thrusterRight = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
        thrusterRight.position.set(0.8, 0, -1);
        thrusterRight.rotation.x = Math.PI / 2;
        spacecraftGroup.add(thrusterRight);
        
        const cargoGeometry = new THREE.BoxGeometry(0.8, 0.8, 1);
        const cargoMaterial = new THREE.MeshPhongMaterial({ color: 0xaa5500 });
        const cargo = new THREE.Mesh(cargoGeometry, cargoMaterial);
        cargo.position.z = -1;
        spacecraftGroup.add(cargo);
        
        const thrusterGlowGeometry = new THREE.ConeGeometry(0.3, 1, 8);
        const thrusterGlowMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.7 
        });
        
        const thrusterGlowLeft = new THREE.Mesh(thrusterGlowGeometry, thrusterGlowMaterial);
        thrusterGlowLeft.position.set(-0.8, 0, -1.5);
        thrusterGlowLeft.rotation.x = -Math.PI / 2;
        thrusterGlowLeft.visible = false;
        thrusterGlowLeft.name = "thrusterGlowLeft";
        spacecraftGroup.add(thrusterGlowLeft);
        
        const thrusterGlowRight = new THREE.Mesh(thrusterGlowGeometry, thrusterGlowMaterial);
        thrusterGlowRight.position.set(0.8, 0, -1.5);
        thrusterGlowRight.rotation.x = -Math.PI / 2;
        thrusterGlowRight.visible = false;
        thrusterGlowRight.name = "thrusterGlowRight";
        spacecraftGroup.add(thrusterGlowRight);
        
        spacecraftGroup.position.set(0, 0, 0);
        
        spacecraftGroup.userData.collider = new THREE.Box3().setFromObject(spacecraftGroup);
        
        return spacecraftGroup;
    }
    
    createAsteroids(count) {
        const asteroids = [];
        const textureLoader = new THREE.TextureLoader();
        const asteroidTexture = textureLoader.load('textures/asteroid.jpg');
        const asteroidNormalMap = textureLoader.load('textures/asteroid_normal.jpg');
        
        for (let i = 0; i < count; i++) {
            const radius = Math.random() * 1.5 + 0.5;
            const geometry = new THREE.SphereGeometry(radius, 8, 6);
            
            const vertices = geometry.attributes.position;
            for (let j = 0; j < vertices.count; j++) {
                const offset = (Math.random() - 0.5) * 0.2 * radius;
                vertices.setZ(j, vertices.getZ(j) + offset);
                vertices.setY(j, vertices.getY(j) + offset);
                vertices.setX(j, vertices.getX(j) + offset);
            }
            
            geometry.computeVertexNormals();
            
            const material = new THREE.MeshStandardMaterial({ 
                color: Math.random() * 0x666666 + 0x333333,
                roughness: 0.9,
                map: asteroidTexture,
                normalMap: asteroidNormalMap
            });
            
            const asteroid = new THREE.Mesh(geometry, material);
            
            let validPosition = false;
            let position;
            
            while (!validPosition) {
                position = new THREE.Vector3(
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100,
                    (Math.random() - 0.5) * 100
                );
                
                if (position.length() > 10) {
                    const distToDelivery = position.distanceTo(this.deliveryPoint.position);
                    if (distToDelivery > 10) {
                        validPosition = true;
                    }
                }
            }
            
            asteroid.position.copy(position);
            asteroid.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            asteroid.userData.spin = new THREE.Vector3(
                (Math.random() - 0.5) * 0.005,
                (Math.random() - 0.5) * 0.005,
                (Math.random() - 0.5) * 0.005
            );

            asteroid.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02,
                (Math.random() - 0.5) * 0.02
            );

            asteroid.userData.collider = new THREE.Sphere(
                asteroid.position.clone(),
                radius
            );

            this.scene.add(asteroid);
            asteroids.push(asteroid);
        }
        
        return asteroids;
    }
    
    createDeliveryPoint() {
        const group = new THREE.Group();

        const baseGeometry = new THREE.CylinderGeometry(3, 3, 0.5, 16);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x0088ff });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        group.add(base);

        const towerGeometry = new THREE.CylinderGeometry(0.5, 0.5, 5, 8);
        const towerMaterial = new THREE.MeshPhongMaterial({ color: 0x888888 });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = 2.5;
        group.add(tower);

        const beaconGeometry = new THREE.SphereGeometry(0.7, 16, 16);
        const beaconMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ffff, 
            transparent: true, 
            opacity: 0.8 
        });
        const beacon = new THREE.Mesh(beaconGeometry, beaconMaterial);
        beacon.position.y = 5.5;
        beacon.userData = {
            pulsePhase: 0,
            animate: function(delta) {
                this.pulsePhase += delta * 2;
                const scale = 1 + 0.2 * Math.sin(this.pulsePhase);
                beacon.scale.set(scale, scale, scale);
                
                beaconMaterial.opacity = 0.5 + 0.5 * Math.sin(this.pulsePhase);
            }
        };
        group.add(beacon);
        
        const panelGeometry = new THREE.BoxGeometry(6, 0.1, 1.5);
        const panelMaterial = new THREE.MeshPhongMaterial({ color: 0x2244aa });
        
        const panel1 = new THREE.Mesh(panelGeometry, panelMaterial);
        panel1.position.set(0, 2, 3);
        panel1.rotation.x = Math.PI / 6;
        group.add(panel1);
        
        const panel2 = new THREE.Mesh(panelGeometry, panelMaterial);
        panel2.position.set(0, 2, -3);
        panel2.rotation.x = -Math.PI / 6;
        group.add(panel2);
        
        group.position.set(50, 30, -40);
        
        const beaconLight = new THREE.PointLight(0x00ffff, 2, 50);
        beaconLight.position.copy(beacon.position);
        group.add(beaconLight);
        
        return group;
    }
    
    createPowerup(type, position) {
        const group = new THREE.Group();
        let color;
        
        switch(type) {
            case 'fuel':
                color = 0x00ff00;
                break;
            case 'shield':
                color = 0x0000ff;
                break;
            case 'speed':
                color = 0xff0000;
                break;
            default:
                color = 0xffff00;
        }
        
        const coreGeometry = new THREE.OctahedronGeometry(0.7, 0);
        const coreMaterial = new THREE.MeshPhongMaterial({ 
            color: color,
            shininess: 100,
            transparent: true,
            opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        group.add(core);
        
        const glowGeometry = new THREE.SphereGeometry(1, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.3
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        group.add(glow);
        
        if (!position) {
            position = new THREE.Vector3(
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 60,
                (Math.random() - 0.5) * 60
            );
        }
        
        group.position.copy(position);
        
        group.userData = {
            type: type,
            rotationSpeed: 0.01,
            pulsePhase: 0,
            collider: new THREE.Sphere(position.clone(), 1.2),
            update: function(delta) {
                group.rotation.y += this.rotationSpeed;
                group.rotation.z += this.rotationSpeed / 2;
                
                this.pulsePhase += delta * 3;
                const scale = 1 + 0.1 * Math.sin(this.pulsePhase);
                glow.scale.set(scale, scale, scale);
                
                this.collider.center.copy(group.position);
            }
        };
        
        return group;
    }
    
    createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 2000;
        
        const positions = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            const radius = 300 + Math.random() * 700;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            sizes[i] = Math.random() * 2 + 0.5;
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            sizeAttenuation: true
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
        
        return stars;
    }
    
    createDeliveryScreenMarker() {
        const marker = document.createElement('div');
        marker.className = 'delivery-marker';
        document.body.appendChild(marker);
        return marker;
    }
    
    updateDeliveryMarker() {
        if (!this.deliveryMarker || !this.deliveryPoint) return;
        
        const vector = this.deliveryPoint.position.clone();
        vector.project(this.camera);
        
        const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
        const y = (-(vector.y * 0.5) + 0.5) * window.innerHeight;
        
        if (vector.z < 1) {
            this.deliveryMarker.style.display = 'block';
            this.deliveryMarker.style.left = x + 'px';
            this.deliveryMarker.style.top = y + 'px';
        } else {
            this.deliveryMarker.style.display = 'none';
        }
    }
    
    startGame() {
        document.getElementById('start-screen').style.display = 'none';
        this.gameActive = true;
        
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this.fuel = 100;
        this.missionTime = 120;
        this.score = 0;
        
        this.spacecraft = this.createSpacecraft();
        this.scene.add(this.spacecraft);
        
        this.deliveryPoint = this.createDeliveryPoint();
        this.scene.add(this.deliveryPoint);
        
        this.deliveryMarker = this.createDeliveryScreenMarker();
        
        let asteroidCount = 30;
        if (this.difficulty === 'easy') asteroidCount = 20;
        if (this.difficulty === 'hard') asteroidCount = 50;
        
        this.asteroids = this.createAsteroids(asteroidCount);
        
        this.stars = this.createStars();
        
        this.spawnPowerups(5);
        
        this.camera.position.set(0, 3, 10);
        this.camera.lookAt(this.spacecraft.position);
        
        // Start background music
        this.bgMusic.play();
        
        this.lastTime = 0;
        requestAnimationFrame(this.animate);
        this.startMissionTimer();
    }
    
    spawnPowerups(count) {
        this.powerups = [];
        const types = ['fuel', 'shield', 'speed'];
        
        for (let i = 0; i < count; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const powerup = this.createPowerup(type);
            this.scene.add(powerup);
            this.powerups.push(powerup);
        }
    }
    
    startMissionTimer() {
        this.missionTimerId = setInterval(() => {
            if (!this.gameActive) {
                clearInterval(this.missionTimerId);
                return;
            }
            
            this.missionTime--;
            document.getElementById('mission-time').textContent = this.missionTime;
            
            if (this.missionTime <= 0) {
                this.gameOver('Time\'s up! Delivery failed.');
            }
        }, 1000);
    }
    
    gameOver(message) {
        this.gameActive = false;
        clearInterval(this.missionTimerId);
        
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
        
        if (message.includes('Successful')) {
            this.sounds.success.play();
        } else {
            this.sounds.collision.play();
        }
        
        const gameOverScreen = document.createElement('div');
        gameOverScreen.style.position = 'absolute';
        gameOverScreen.style.top = '0';
        gameOverScreen.style.left = '0';
        gameOverScreen.style.width = '100%';
        gameOverScreen.style.height = '100%';
        gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gameOverScreen.style.display = 'flex';
        gameOverScreen.style.flexDirection = 'column';
        gameOverScreen.style.justifyContent = 'center';
        gameOverScreen.style.alignItems = 'center';
        gameOverScreen.style.zIndex = '100';
        
        const gameOverTitle = document.createElement('h1');
        gameOverTitle.textContent = message;
        gameOverTitle.style.color = '#0ff';
        gameOverTitle.style.fontSize = '3rem';
        gameOverTitle.style.marginBottom = '2rem';
        
        const scoreDisplay = document.createElement('h2');
        scoreDisplay.textContent = `Final Score: ${this.score}`;
        scoreDisplay.style.color = '#fff';
        scoreDisplay.style.fontSize = '2rem';
        scoreDisplay.style.marginBottom = '2rem';
        
        const restartButton = document.createElement('button');
        restartButton.textContent = 'Try Again';
        restartButton.style.backgroundColor = '#0ff';
        restartButton.style.color = '#000';
        restartButton.style.border = 'none';
        restartButton.style.padding = '15px 30px';
        restartButton.style.fontSize = '1.5rem';
        restartButton.style.borderRadius = '5px';
        restartButton.style.cursor = 'pointer';
        restartButton.style.marginBottom = '1rem';
        
        const menuButton = document.createElement('button');
        menuButton.textContent = 'Main Menu';
        menuButton.style.backgroundColor = '#666';
        menuButton.style.color = '#fff';
        menuButton.style.border = 'none';
        menuButton.style.padding = '15px 30px';
        menuButton.style.fontSize = '1.5rem';
        menuButton.style.borderRadius = '5px';
        menuButton.style.cursor = 'pointer';
        
        restartButton.addEventListener('click', () => {
            this.cleanup();
            document.body.removeChild(gameOverScreen);
            this.startGame();
        });
        
        menuButton.addEventListener('click', () => {
            this.cleanup();
            document.body.removeChild(gameOverScreen);
            document.getElementById('start-screen').style.display = 'flex';
        });
        
        gameOverScreen.appendChild(gameOverTitle);
        gameOverScreen.appendChild(scoreDisplay);
        gameOverScreen.appendChild(restartButton);
        gameOverScreen.appendChild(menuButton);
        document.body.appendChild(gameOverScreen);
    }
    
    cleanup() {
        if (this.spacecraft) this.scene.remove(this.spacecraft);
        if (this.deliveryPoint) this.scene.remove(this.deliveryPoint);
        if (this.deliveryMarker) document.body.removeChild(this.deliveryMarker);
        
        this.asteroids.forEach(asteroid => this.scene.remove(asteroid));
        this.powerups.forEach(powerup => this.scene.remove(powerup));
        if (this.stars) this.scene.remove(this.stars);
    }
    
    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    handleKeyDown(event) {
        if (!this.gameActive) return;
        
        switch(event.key) {
            case 'w': this.thrusters.forward = true; break;
            case 's': this.thrusters.backward = true; break;
            case 'a': this.thrusters.left = true; break;
            case 'd': this.thrusters.right = true; break;
            case 'r': this.thrusters.up = true; break;
            case 'f': this.thrusters.down = true; break;
            case 'q': this.thrusters.rollLeft = true; break;
            case 'e': this.thrusters.rollRight = true; break;
            case 'ArrowUp': 
                this.angularVelocity.x -= this.angularThrusterPower * 3; 
                break;
            case 'ArrowDown': 
                this.angularVelocity.x += this.angularThrusterPower * 3; 
                break;
            case 'ArrowLeft': 
                this.angularVelocity.y -= this.angularThrusterPower * 3; 
                break;
            case 'ArrowRight': 
                this.angularVelocity.y += this.angularThrusterPower * 3; 
                break;
            case ' ':
                if (this.fuel >= 20) {
                    this.velocity.multiplyScalar(0.2);
                    this.angularVelocity.multiplyScalar(0.2);
                    this.fuel -= 20;
                    this.sounds.thruster.currentTime = 0;
                    this.sounds.thruster.play();
                }
                break;
        }
    }
    
    handleKeyUp(event) {
        if (!this.gameActive) return;
        
        switch(event.key) {
            case 'w': this.thrusters.forward = false; break;
            case 's': this.thrusters.backward = false; break;
            case 'a': this.thrusters.left = false; break;
            case 'd': this.thrusters.right = false; break;
            case 'r': this.thrusters.up = false; break;
            case 'f': this.thrusters.down = false; break;
            case 'q': this.thrusters.rollLeft = false; break;
            case 'e': this.thrusters.rollRight = false; break;
        }
    }
    
    animate(time) {
        if (!this.gameActive) return;
        
        const delta = this.lastTime ? (time - this.lastTime) / 1000 : 0.016;
        this.lastTime = time;
        
        requestAnimationFrame(this.animate);
        
        if (this.spacecraft) {
            this.updateSpacecraft(delta);
            this.checkCollisions();
            this.checkPowerupCollisions();
            this.checkDelivery();
            this.updateHUD();
        }
        
        if (this.deliveryPoint) {
            const beacon = this.deliveryPoint.children[3];
            if (beacon && beacon.userData && typeof beacon.userData.animate === 'function') {
                beacon.userData.animate(delta);
            }

            this.updateDeliveryMarker();
        }

        if (this.asteroids) {
            this.asteroids.forEach(asteroid => {
                asteroid.rotation.x += asteroid.userData.spin.x;
                asteroid.rotation.y += asteroid.userData.spin.y;
                asteroid.rotation.z += asteroid.userData.spin.z;

                if (asteroid.userData.velocity) {
                    asteroid.position.addScaledVector(asteroid.userData.velocity, delta * 50);
                    asteroid.userData.collider.center.copy(asteroid.position);
                }
            });
        }
        
        if (this.powerups) {
            this.powerups.forEach(powerup => {
                if (powerup.userData && typeof powerup.userData.update === 'function') {
                    powerup.userData.update(delta);
                }
            });
        }
        
        this.renderer.render(this.scene, this.camera);
    }
    
    updateSpacecraft(delta) {
        this.velocity.multiplyScalar(this.dampingFactor);
        this.angularVelocity.multiplyScalar(this.dampingFactor);
        
        let thrusterActive = false;
        if (this.fuel > 0) {
            const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(this.spacecraft.quaternion);
            const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(this.spacecraft.quaternion);
            const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(this.spacecraft.quaternion);
            
            if (this.thrusters.forward) {
                this.velocity.addScaledVector(forwardVector, this.thrusterPower);
                thrusterActive = true;
            }
            if (this.thrusters.backward) {
                this.velocity.addScaledVector(forwardVector, -this.thrusterPower);
                thrusterActive = true;
            }
            if (this.thrusters.right) {
                this.velocity