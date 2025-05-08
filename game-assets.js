function createSpacecraft() {
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
    cargo.name = "cargo";
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

    const sideThrustersGeometry = new THREE.ConeGeometry(0.15, 0.5, 8);
    const sideThrustersGlowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        transparent: true, 
        opacity: 0.7 
    });
    
    const leftThrusterGlow = new THREE.Mesh(sideThrustersGeometry, sideThrustersGlowMaterial);
    leftThrusterGlow.position.set(-1.5, 0, -0.5);
    leftThrusterGlow.rotation.z = Math.PI / 2;
    leftThrusterGlow.visible = false;
    leftThrusterGlow.name = "leftThrusterGlow";
    spacecraftGroup.add(leftThrusterGlow);
    
    const rightThrusterGlow = new THREE.Mesh(sideThrustersGeometry, sideThrustersGlowMaterial);
    rightThrusterGlow.position.set(1.5, 0, -0.5);
    rightThrusterGlow.rotation.z = -Math.PI / 2;
    rightThrusterGlow.visible = false;
    rightThrusterGlow.name = "rightThrusterGlow";
    spacecraftGroup.add(rightThrusterGlow);
    
    const upThrusterGlow = new THREE.Mesh(sideThrustersGeometry, sideThrustersGlowMaterial);
    upThrusterGlow.position.set(0, -1, -0.5);
    upThrusterGlow.rotation.x = Math.PI / 2;
    upThrusterGlow.visible = false;
    upThrusterGlow.name = "upThrusterGlow";
    spacecraftGroup.add(upThrusterGlow);
    
    const downThrusterGlow = new THREE.Mesh(sideThrustersGeometry, sideThrustersGlowMaterial);
    downThrusterGlow.position.set(0, 1, -0.5);
    downThrusterGlow.rotation.x = -Math.PI / 2;
    downThrusterGlow.visible = false;
    downThrusterGlow.name = "downThrusterGlow";
    spacecraftGroup.add(downThrusterGlow);
    
    spacecraftGroup.position.set(0, 0, 0);
    return spacecraftGroup;
}

function createAsteroids(count, deliveryPoint) {
    const asteroids = [];
    const asteroidTexture = new THREE.TextureLoader().load('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/images/stone.jpg');
    
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
            map: asteroidTexture
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
                const distToDelivery = position.distanceTo(deliveryPoint.position);
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
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01
        );

        asteroids.push(asteroid);
    }
    
    return asteroids;
}

function createDeliveryPoint() {
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
    
    const ringGeometry = new THREE.RingGeometry(2.5, 2.7, 32);
    const ringMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x00ffff, 
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
    });
    const landingRing = new THREE.Mesh(ringGeometry, ringMaterial);
    landingRing.rotation.x = -Math.PI / 2;
    landingRing.position.y = 0.26;
    landingRing.userData = {
        pulsePhase: Math.PI / 2,
        animate: function(delta) {
            this.pulsePhase += delta * 2;
            ringMaterial.opacity = 0.4 + 0.3 * Math.sin(this.pulsePhase);
        }
    };
    group.add(landingRing);
    
    group.position.set(50, 30, -40);

    const beaconLight = new THREE.PointLight(0x00ffff, 2, 50);
    beaconLight.position.copy(beacon.position);
    group.add(beaconLight);
    
    return group;
}

function createStars() {
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
    return stars;
}

function createSpaceDebris(count) {
    const debris = [];
    const debrisMaterials = [
        new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 }),
        new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.8 }),
        new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.7 })
    ];
    
    const debrisGeometries = [
        new THREE.TetrahedronGeometry(0.3),
        new THREE.OctahedronGeometry(0.2),
        new THREE.BoxGeometry(0.4, 0.4, 0.4)
    ];
    
    for (let i = 0; i < count; i++) {
        const geomIndex = Math.floor(Math.random() * debrisGeometries.length);
        const matIndex = Math.floor(Math.random() * debrisMaterials.length);
        
        const piece = new THREE.Mesh(debrisGeometries[geomIndex], debrisMaterials[matIndex]);

        const position = new THREE.Vector3(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
        
        if (position.length() < 15) {
            position.normalize().multiplyScalar(15 + Math.random() * 5);
        }
        
        piece.position.copy(position);
        
        piece.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );
        
        piece.userData.spin = new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.01
        );
        
        piece.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02,
            (Math.random() - 0.5) * 0.02
        );
        
        debris.push(piece);
    }
    
    return debris;
}

function createPowerUps(count) {
    const powerUps = [];
    
    for (let i = 0; i < count; i++) {
        const type = Math.random() < 0.5 ? 'fuel' : 'shield';
        let color = type === 'fuel' ? 0x00ff00 : 0x0000ff;
        
        const geometry = new THREE.OctahedronGeometry(0.5);
        const material = new THREE.MeshPhongMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        
        const powerUp = new THREE.Mesh(geometry, material);
        
        const position = new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        );

        if (position.length() < 20) {
            position.normalize().multiplyScalar(20 + Math.random() * 10);
        }
        
        powerUp.position.copy(position);
        
        powerUp.userData = {
            type: type,
            spin: new THREE.Vector3(0, 0.01, 0),
            pulsePhase: Math.random() * Math.PI * 2,
            animate: function(delta) {
                this.pulsePhase += delta * 2;
                const scale = 1 + 0.1 * Math.sin(this.pulsePhase);
                powerUp.scale.set(scale, scale, scale);
                material.opacity = 0.6 + 0.4 * Math.sin(this.pulsePhase);
            }
        };
        
        powerUps.push(powerUp);
    }
    
    return powerUps;
}

// Creating particle effects
function createExplosionEffect() {
    const particleCount = 50;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 0;
        
        const colorValue = Math.random() < 0.5 ? 0xffaa00 : 0xff0000;
        color.set(colorValue);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        sizes[i] = Math.random() * 0.5 + 0.1;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const material = new THREE.PointsMaterial({
        size: 0.1,
        transparent: true,
        opacity: 1.0,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    const particles = new THREE.Points(geometry, material);
    
    particles.userData = {
        velocities: [],
        lifetimes: [],
        activate: function(position) {
            particles.position.copy(position);
            
            const positionAttribute = particles.geometry.getAttribute('position');
            
            for (let i = 0; i < particleCount; i++) {
                positionAttribute.setXYZ(i, 0, 0, 0);
                
                const velocity = new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2
                );
                velocity.normalize().multiplyScalar(0.1 + Math.random() * 0.2);
                
                this.velocities[i] = velocity;
                this.lifetimes[i] = 0.5 + Math.random() * 1.0; // 0.5 to 1.5 seconds
            }
            
            positionAttribute.needsUpdate = true;
            material.opacity = 1.0;
            particles.visible = true;
        },
        update: function(delta) {
            if (!particles.visible) return;
            
            let allDead = true;
            const positionAttribute = particles.geometry.getAttribute('position');
            
            for (let i = 0; i < particleCount; i++) {
                if (this.lifetimes[i] > 0) {
                    positionAttribute.setXYZ(
                        i,
                        positionAttribute.getX(i) + this.velocities[i].x,
                        positionAttribute.getY(i) + this.velocities[i].y,
                        positionAttribute.getZ(i) + this.velocities[i].z
                    );
                    
                    // Update lifetime
                    this.lifetimes[i] -= delta;
                    allDead = false;
                }
            }
            
            positionAttribute.needsUpdate = true;
            
            if (allDead) {
                particles.visible = false;
            } else {
                material.opacity -= delta * 0.5;
                if (material.opacity < 0) material.opacity = 0;
            }
        }
    };
    
    particles.visible = false; // Start invisible
    return particles;
}

export {
    createSpacecraft,
    createAsteroids,
    createDeliveryPoint,
    createStars,
    createSpaceDebris,
    createPowerUps,
    createExplosionEffect
};