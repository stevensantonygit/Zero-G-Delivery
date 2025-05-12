class SpacecraftCustomizer {
    constructor(scene, spacecraftData) {
        this.scene = scene;
        this.spacecraftData = spacecraftData;
        this.components = {};
        this.customizations = {
            color: "#888888",
            pattern: "none",
            thrusters: "standard",
            wings: "standard",
            cockpit: "standard",
            cargo: "standard"
        };
        this.upgrades = [];
    }

    loadSpacecraftData(id) {
        const spacecraft = this.spacecraftData.find(ship => ship.id === id);
        if (spacecraft) {
            this.currentSpacecraft = spacecraft;
            this.applyBaseStats(spacecraft);
            return true;
        }
        return false;
    }

    applyBaseStats(spacecraft) {
        this.baseStats = {
            speed: spacecraft.speed,
            maneuverability: spacecraft.maneuverability,
            fuelCapacity: spacecraft.fuelCapacity,
            fuelConsumption: spacecraft.fuelConsumption,
            cargoCapacity: spacecraft.cargoCapacity
        };
        
        if (spacecraft.stealthRating) {
            this.baseStats.stealthRating = spacecraft.stealthRating;
        }
        
        this.calculateFinalStats();
    }
    
    calculateFinalStats() {
        this.stats = { ...this.baseStats };
        
        for (const upgrade of this.upgrades) {
            for (const [stat, modifier] of Object.entries(upgrade.effects)) {
                if (this.stats[stat] !== undefined) {\
                    if (typeof modifier === 'number') {
                        this.stats[stat] *= modifier;
                    } 
                    else if (typeof modifier === 'object' && modifier.type === 'add') {
                        this.stats[stat] += modifier.value;
                    }
                } else {
                    this.stats[stat] = modifier;
                }
            }
        }
        
        return this.stats;
    }
    
    createSpacecraftModel() {
        const spacecraftGroup = new THREE.Group();

        this.components.body = this.createBody();
        this.components.wings = this.createWings();
        this.components.cockpit = this.createCockpit();
        this.components.thrusters = this.createThrusters();
        this.components.cargo = this.createCargo();

        for (const component of Object.values(this.components)) {
            spacecraftGroup.add(component);
        }
        
        return spacecraftGroup;
    }
    
    createBody() {
        const bodyGeometry = new THREE.CylinderGeometry(0.5, 0.7, 2, 8);
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: this.customizations.color,
            shininess: 100 
        });
        
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.rotation.x = Math.PI / 2;
        
        if (this.customizations.pattern !== "none") {
            this.applyPattern(body, this.customizations.pattern);
        }
        
        return body;
    }
    
    createWings() {
        let wings;
        
        switch (this.customizations.wings) {
            case "standard":
                const wingGeometry = new THREE.BoxGeometry(3, 0.1, 0.8);
                const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
                wings = new THREE.Mesh(wingGeometry, wingMaterial);
                wings.position.y = -0.2;
                break;
                
            case "aerodynamic":
                const shape = new THREE.Shape();
                shape.moveTo(0, 0);
                shape.lineTo(1.5, 0.3);
                shape.lineTo(1.5, -0.3);
                shape.lineTo(0, 0);
                
                const extrudeSettings = {
                    steps: 1,
                    depth: 0.8,
                    bevelEnabled: false
                };
                
                const aerodynamicGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
                const aerodynamicMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
                
                const rightWing = new THREE.Mesh(aerodynamicGeometry, aerodynamicMaterial);
                
                const leftWing = rightWing.clone();
                leftWing.rotation.y = Math.PI;
                
                wings = new THREE.Group();
                wings.add(rightWing);
                wings.add(leftWing);
                rightWing.position.set(-1.5, 0, 0.4);
                leftWing.position.set(1.5, 0, -0.4);
                wings.position.y = -0.2;
                break;
                
            case "military":
                const militaryWingShape = new THREE.Shape();
                militaryWingShape.moveTo(0, 0);
                militaryWingShape.lineTo(1.8, 0);
                militaryWingShape.lineTo(1.4, -0.4);
                militaryWingShape.lineTo(0, -0.2);
                militaryWingShape.lineTo(0, 0);
                
                const militaryExtrudeSettings = {
                    steps: 1,
                    depth: 0.1,
                    bevelEnabled: false
                };
                
                const militaryGeometry = new THREE.ExtrudeGeometry(militaryWingShape, militaryExtrudeSettings);
                const militaryMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
                
                const rightMilitaryWing = new THREE.Mesh(militaryGeometry, militaryMaterial);
                
                const leftMilitaryWing = rightMilitaryWing.clone();
                leftMilitaryWing.rotation.y = Math.PI;
                
                wings = new THREE.Group();
                wings.add(rightMilitaryWing);
                wings.add(leftMilitaryWing);
                rightMilitaryWing.position.set(-1.5, 0, 0.05);
                leftMilitaryWing.position.set(1.5, 0, -0.05);
                wings.position.y = -0.2;
                break;
                
            case "cargo":
                const cargoWingGeometry = new THREE.BoxGeometry(3.5, 0.2, 1.2);
                const cargoWingMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
                wings = new THREE.Mesh(cargoWingGeometry, cargoWingMaterial);
                wings.position.y = -0.3;
                break;
        }
        
        return wings;
    }
    
    createCockpit() {
        let cockpit;
        
        switch (this.customizations.cockpit) {
            case "standard":
                const cockpitGeometry = new THREE.SphereGeometry(0.4, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
                const cockpitMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x44aaff, 
                    transparent: true, 
                    opacity: 0.7 
                });
                cockpit = new THREE.Mesh(cockpitGeometry, cockpitMaterial);
                cockpit.position.z = 0.5;
                cockpit.rotation.x = Math.PI;
                break;
                
            case "fighter":
                const fighterGeometry = new THREE.ConeGeometry(0.4, 0.8, 4, 1, false, Math.PI/4);
                const fighterMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x55ccff, 
                    transparent: true, 
                    opacity: 0.8
                });
                cockpit = new THREE.Mesh(fighterGeometry, fighterMaterial);
                cockpit.position.z = 0.6;
                cockpit.rotation.x = -Math.PI/2;
                cockpit.rotation.y = Math.PI/4;
                break;
                
            case "bubble":
                const bubbleGeometry = new THREE.SphereGeometry(0.5, 16, 16);
                const bubbleMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x88ddff, 
                    transparent: true, 
                    opacity: 0.6,
                    envMap: this.getCockpitReflection()
                });
                cockpit = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
                cockpit.position.z = 0.3;
                cockpit.scale.set(1, 0.7, 1);
                break;
                
            case "stealth":
                const stealthGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.8);
                const stealthMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x222222, 
                    transparent: true, 
                    opacity: 0.9,
                    shininess: 150
                });
                cockpit = new THREE.Mesh(stealthGeometry, stealthMaterial);
                cockpit.position.z = 0.5;

                const windowGeometry = new THREE.PlaneGeometry(0.4, 0.1);
                const windowMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x66ccff, 
                    transparent: true, 
                    opacity: 0.7
                });
                const window = new THREE.Mesh(windowGeometry, windowMaterial);
                window.position.z = 0.11;
                window.rotation.x = Math.PI/2;
                cockpit.add(window);
                break;
        }
        
        return cockpit;
    }
    
    createThrusters() {
        const thrustersGroup = new THREE.Group();
        
        switch (this.customizations.thrusters) {
            case "standard":
                const thrusterGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.4, 8);
                const thrusterMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
                
                const thrusterLeft = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
                thrusterLeft.position.set(-0.8, 0, -1);
                thrusterLeft.rotation.x = Math.PI / 2;
                thrustersGroup.add(thrusterLeft);
                
                const thrusterRight = new THREE.Mesh(thrusterGeometry, thrusterMaterial);
                thrusterRight.position.set(0.8, 0, -1);
                thrusterRight.rotation.x = Math.PI / 2;
                thrustersGroup.add(thrusterRight);
                
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
                thrustersGroup.add(thrusterGlowLeft);
                
                const thrusterGlowRight = new THREE.Mesh(thrusterGlowGeometry, thrusterGlowMaterial);
                thrusterGlowRight.position.set(0.8, 0, -1.5);
                thrusterGlowRight.rotation.x = -Math.PI / 2;
                thrusterGlowRight.visible = false;
                thrusterGlowRight.name = "thrusterGlowRight";
                thrustersGroup.add(thrusterGlowRight);
                break;
                
            case "high-power":
                const hpThrusterGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.6, 8);
                const hpThrusterMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x444444,
                    metalness: 0.7,
                    roughness: 0.2
                });
                
                const hpThrusterLeft = new THREE.Mesh(hpThrusterGeometry, hpThrusterMaterial);
                hpThrusterLeft.position.set(-0.8, 0, -1.1);
                hpThrusterLeft.rotation.x = Math.PI / 2;
                thrustersGroup.add(hpThrusterLeft);
                
                const hpThrusterRight = new THREE.Mesh(hpThrusterGeometry, hpThrusterMaterial);
                hpThrusterRight.position.set(0.8, 0, -1.1);
                hpThrusterRight.rotation.x = Math.PI / 2;
                thrustersGroup.add(hpThrusterRight);

                const finGeometry = new THREE.BoxGeometry(0.05, 0.4, 0.3);
                const finMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
                
                for (let i = 0; i < 4; i++) {
                    const leftFin = new THREE.Mesh(finGeometry, finMaterial);
                    leftFin.position.set(-0.8, 0, -1.1);
                    leftFin.rotation.z = i * Math.PI / 2;
                    leftFin.position.x += Math.sin(i * Math.PI / 2) * 0.4;
                    leftFin.position.y += Math.cos(i * Math.PI / 2) * 0.4;
                    thrustersGroup.add(leftFin);
                    
                    const rightFin = new THREE.Mesh(finGeometry, finMaterial);
                    rightFin.position.set(0.8, 0, -1.1);
                    rightFin.rotation.z = i * Math.PI / 2;
                    rightFin.position.x += Math.sin(i * Math.PI / 2) * 0.4;
                    rightFin.position.y += Math.cos(i * Math.PI / 2) * 0.4;
                    thrustersGroup.add(rightFin);
                }
                
                const hpGlowGeometry = new THREE.ConeGeometry(0.4, 1.5, 8);
                const hpGlowMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x00ffaa, 
                    transparent: true, 
                    opacity: 0.8 
                });
                
                const hpGlowLeft = new THREE.Mesh(hpGlowGeometry, hpGlowMaterial);
                hpGlowLeft.position.set(-0.8, 0, -1.7);
                hpGlowLeft.rotation.x = -Math.PI / 2;
                hpGlowLeft.visible = false;
                hpGlowLeft.name = "thrusterGlowLeft";
                thrustersGroup.add(hpGlowLeft);
                
                const hpGlowRight = new THREE.Mesh(hpGlowGeometry, hpGlowMaterial);
                hpGlowRight.position.set(0.8, 0, -1.7);
                hpGlowRight.rotation.x = -Math.PI / 2;
                hpGlowRight.visible = false;
                hpGlowRight.name = "thrusterGlowRight";
                thrustersGroup.add(hpGlowRight);
                break;
                
            case "stealth":
                const stealthThrusterGeometry = new THREE.BoxGeometry(0.6, 0.2, 0.4);
                const stealthThrusterMaterial = new THREE.MeshPhongMaterial({ 
                    color: 0x222222,
                    emissive: 0x001111
                });
                
                const stealthThrusterLeft = new THREE.Mesh(stealthThrusterGeometry, stealthThrusterMaterial);
                stealthThrusterLeft.position.set(-0.7, 0, -1);
                thrustersGroup.add(stealthThrusterLeft);
                
                const stealthThrusterRight = new THREE.Mesh(stealthThrusterGeometry, stealthThrusterMaterial);
                stealthThrusterRight.position.set(0.7, 0, -1);
                thrustersGroup.add(stealthThrusterRight);
                
                const stealthGlowGeometry = new THREE.ConeGeometry(0.2, 0.6, 8);
                const stealthGlowMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x003333, 
                    transparent: true, 
                    opacity: 0.5 
                });
                
                const stealthGlowLeft = new THREE.Mesh(stealthGlowGeometry, stealthGlowMaterial);
                stealthGlowLeft.position.set(-0.7, 0, -1.3);
                stealthGlowLeft.rotation.x = -Math.PI / 2;
                stealthGlowLeft.visible = false;
                stealthGlowLeft.name = "thrusterGlowLeft";
                thrustersGroup.add(stealthGlowLeft);
                
                const stealthGlowRight = new THREE.Mesh(stealthGlowGeometry, stealthGlowMaterial);
                stealthGlowRight.position.set(0.7, 0, -1.3);
                stealthGlowRight.rotation.x = -Math.PI / 2;
                stealthGlowRight.visible = false;
                stealthGlowRight.name = "thrusterGlowRight";
                thrustersGroup.add(stealthGlowRight);
                break;
                
            case "quad":
                const quadThrusterGeometry = new THREE.CylinderGeometry(0.15, 0.2, 0.4, 8);
                const quadThrusterMaterial = new THREE.MeshPhongMaterial({ color: 0x555555 });
                
                const quadPositions = [
                    [-0.8, -0.3, -1],
                    [-0.8, 0.3, -1],
                    [0.8, -0.3, -1],
                    [0.8, 0.3, -1]
                ];
                
                const quadGlowGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
                const quadGlowMaterial = new THREE.MeshBasicMaterial({ 
                    color: 0x33ffff, 
                    transparent: true, 
                    opacity: 0.7 
                })