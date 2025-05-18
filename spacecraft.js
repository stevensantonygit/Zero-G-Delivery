class Spacecraft {
    constructor() {
        this.object = null;
        this.velocity = new THREE.Vector3();
        this.angularVelocity = new THREE.Vector3();
        this.fuel = 100;
        this.fuelConsumptionRate = 0.05;
        this.fuelRegenRate = 0.02;
        this.thrusterPower = 0.005;
        this.maxSpeed = 0.3;
        this.angularThrusterPower = 0.0015;
        this.dampingFactor = 0.995;
        
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
    }
    
    create() {
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
        this.object = spacecraftGroup;
        
        return spacecraftGroup;
    }
    
    update(delta) {
        if (!this.object) return;

        this.velocity.multiplyScalar(this.dampingFactor);
        this.angularVelocity.multiplyScalar(this.dampingFactor);
        
        let thrusterActive = false;
        if (this.fuel > 0) {
            const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(this.object.quaternion);
            const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(this.object.quaternion);
            const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(this.object.quaternion);
            
            if (this.thrusters.forward) {
                this.velocity.addScaledVector(forwardVector, this.thrusterPower);
                thrusterActive = true;
            }
            if (this.thrusters.backward) {
                this.velocity.addScaledVector(forwardVector, -this.thrusterPower);
                thrusterActive = true;
            }
            if (this.thrusters.right) {
                this.velocity.addScaledVector(rightVector, this.thrusterPower);
                thrusterActive = true;
            }
            if (this.thrusters.left) {
                this.velocity.addScaledVector(rightVector, -this.thrusterPower);
                thrusterActive = true;
            }
            if (this.thrusters.up) {
                this.velocity.addScaledVector(upVector, this.thrusterPower);
                thrusterActive = true;
            }
            if (this.thrusters.down) {
                this.velocity.addScaledVector(upVector, -this.thrusterPower);
                thrusterActive = true;
            }
            
            if (this.thrusters.rollLeft) {
                this.angularVelocity.z += this.angularThrusterPower;
                thrusterActive = true;
            }
            if (this.thrusters.rollRight) {
                this.angularVelocity.z -= this.angularThrusterPower;
                thrusterActive = true;
            }
            
            if (thrusterActive) {
                this.fuel = Math.max(0, this.fuel - this.fuelConsumptionRate);
            } else {
                this.fuel = Math.min(100, this.fuel + this.fuelRegenRate);
            }
        }

        const thrusterGlowLeft = this.object.getObjectByName("thrusterGlowLeft");
        const thrusterGlowRight = this.object.getObjectByName("thrusterGlowRight");
        
        if (thrusterGlowLeft && thrusterGlowRight) {
            thrusterGlowLeft.visible = this.thrusters.forward;
            thrusterGlowRight.visible = this.thrusters.forward;
        }

        const currentSpeed = this.velocity.length();
        if (currentSpeed > this.maxSpeed) {
            this.velocity.normalize().multiplyScalar(this.maxSpeed);
        }

        this.object.position.addScaledVector(this.velocity, delta * 50);
        
        this.object.rotation.x += this.angularVelocity.x * delta * 50;
        this.object.rotation.y += this.angularVelocity.y * delta * 50;
        this.object.rotation.z += this.angularVelocity.z * delta * 50;
    }
    
    emergencyStop() {
        if (this.fuel >= 20) {
            this.velocity.multiplyScalar(0.2);
            this.angularVelocity.multiplyScalar(0.2);
            this.fuel -= 20;
            return true;
        }
        return false;
    }
    
    getSpeed() {
        return this.velocity.length() * 100;
    }
    
    reset() {
        this.velocity.set(0, 0, 0);
        this.angularVelocity.set(0, 0, 0);
        this.fuel = 100;
        
        Object.keys(this.thrusters).forEach(key => {
            this.thrusters[key] = false;
        });
        
        if (this.object) {
            this.object.position.set(0, 0, 0);
            this.object.rotation.set(0, 0, 0);
        }
    }
}