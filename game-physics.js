class GamePhysics {
    constructor(config) {
        this.thrusterPower = config.thrusterPower || 0.005;
        this.maxSpeed = config.maxSpeed || 0.3;
        this.angularThrusterPower = config.angularThrusterPower || 0.0015;
        this.dampingFactor = config.dampingFactor || 0.995;
        this.fuelConsumptionRate = config.fuelConsumptionRate || 0.05;
        this.fuelRegenRate = config.fuelRegenRate || 0.02;
        
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
        this.shieldActive = false;
        this.shieldEnergy = 0;
        this.cargoStatus = "Secure";

        this.updateSpacecraft = this.updateSpacecraft.bind(this);
        this.checkCollisions = this.checkCollisions.bind(this);
        this.checkDelivery = this.checkDelivery.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.checkPowerUpCollisions = this.checkPowerUpCollisions.bind(this);
    }

    setupControls() {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }

    removeControls() {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
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
                }
                break;
            case 'c':
                if (this.shieldEnergy > 0) {
                    this.shieldActive = !this.shieldActive;
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

    updateSpacecraft(delta, spacecraft) {
        if (!spacecraft) return;

        this.velocity.multiplyScalar(this.dampingFactor);
        this.angularVelocity.multiplyScalar(this.dampingFactor);
        
        let thrusterActive = false;
        if (this.fuel > 0) {
            const forwardVector = new THREE.Vector3(0, 0, -1).applyQuaternion(spacecraft.quaternion);
            const rightVector = new THREE.Vector3(1, 0, 0).applyQuaternion(spacecraft.quaternion);
            const upVector = new THREE.Vector3(0, 1, 0).applyQuaternion(spacecraft.quaternion);
            
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
                thrusterActive =