class SpacePhysics {
    constructor(options = {}) {
        this.gravityStrength = options.gravityStrength || 0.005;
        this.collisionDamping = options.collisionDamping || 0.8;
        this.rotationalDamping = options.rotationalDamping || 0.995;
        this.linearDamping = options.linearDamping || 0.995;
        this.gravitySources = [];
        this.physicsObjects = [];
        
        this.useRealisticPhysics = options.useRealisticPhysics || false;
        this.useThrusterInertia = options.useThrusterInertia || true;
        this.useAngularMomentum = options.useAngularMomentum || true;
    }

    addGravitySource(position, mass, radius, falloffRate = 2) {
        this.gravitySources.push({
            position,
            mass,
            radius,
            falloffRate
        });
        return this.gravitySources.length - 1;
    }

    registerObject(object, options = {}) {
        const physicsBody = {
            object: object,
            mass: options.mass || 1,
            velocity: options.velocity || new THREE.Vector3(0, 0, 0),
            angularVelocity: options.angularVelocity || new THREE.Vector3(0, 0, 0),
            radius: options.radius || 1,
            affectedByGravity: options.affectedByGravity !== undefined ? options.affectedByGravity : true,
            isStatic: options.isStatic || false,
            collisionResponse: options.collisionResponse !== undefined ? options.collisionResponse : true,
            thrusterForce: new THREE.Vector3(0, 0, 0),
            thrusterTorque: new THREE.Vector3(0, 0, 0),
            momentOfInertia: options.momentOfInertia || new THREE.Vector3(1, 1, 1)
        };
        
        this.physicsObjects.push(physicsBody);
        return this.physicsObjects.length - 1;
    }
    
    /**
     * Apply thruster force to an object
     * @param {number} objectIndex - Index of the physics object
     * @param {THREE.Vector3} force - Force vector in world space
     * @param {THREE.Vector3} applicationPoint - Point of application in local space for torque calculation
     */
    applyThrusterForce(objectIndex, force, applicationPoint = null) {
        const body = this.physicsObjects[objectIndex];
        if (!body) return;
        
        body.thrusterForce.add(force);
        
        if (applicationPoint && this.useAngularMomentum) {
            const worldApplicationPoint = applicationPoint.clone().applyQuaternion(body.object.quaternion);
            const r = worldApplicationPoint.clone().sub(body.object.position);
            const torque = new THREE.Vector3().crossVectors(r, force);
            body.thrusterTorque.add(torque);
        }
    }

    applyAngularImpulse(objectIndex, angularImpulse) {
        const body = this.physicsObjects[objectIndex];
        if (!body) return;
        
        const angularAcceleration = new THREE.Vector3(
            angularImpulse.x / body.momentOfInertia.x,
            angularImpulse.y / body.momentOfInertia.y,
            angularImpulse.z / body.momentOfInertia.z
        );
        
        body.angularVelocity.add(angularAcceleration);
    }

    calculateGravitationalForces(delta) {
        if (this.gravitySources.length === 0 || !this.useRealisticPhysics) return;
        
        for (const body of this.physicsObjects) {
            if (!body.affectedByGravity || body.isStatic) continue;
            
            for (const source of this.gravitySources) {
                const distanceVector = new THREE.Vector3().subVectors(source.position, body.object.position);
                const distance = distanceVector.length();
                
                if (distance < source.radius) continue;
                
                const forceMagnitude = this.gravityStrength * source.mass * body.mass / 
                    Math.pow(distance, source.falloffRate);
                
                const forceDirection = distanceVector.normalize();
                const force = forceDirection.multiplyScalar(forceMagnitude);
                
                const acceleration = force.divideScalar(body.mass);
                body.velocity.addScaledVector(acceleration, delta);
            }
        }
    }

    handleCollisions(delta) {
        for (let i = 0; i < this.physicsObjects.length; i++) {
            const bodyA = this.physicsObjects[i];
            if (bodyA.isStatic) continue;

            for (let j = i + 1; j < this.physicsObjects.length; j++) {
                const bodyB = this.physicsObjects[j];
                
                const distance = bodyA.object.position.distanceTo(bodyB.object.position);
                const minDistance = bodyA.radius + bodyB.radius;
                
                if (distance < minDistance) {
                    if (!bodyA.collisionResponse && !bodyB.collisionResponse) continue;

                    const normal = new THREE.Vector3().subVectors(
                        bodyB.object.position, 
                        bodyA.object.position
                    ).normalize();
                    
                    const relativeVelocity = new THREE.Vector3().subVectors(
                        bodyB.velocity, 
                        bodyA.velocity
                    );
                    
                    const velocityAlongNormal = relativeVelocity.dot(normal);
                    
                    if (velocityAlongNormal > 0) continue;
                    
                    const e = this.collisionDamping;

                    let j = -(1 + e) * velocityAlongNormal;
                    j /= 1/bodyA.mass + 1/bodyB.mass;
                    
                    const impulse = normal.clone().multiplyScalar(j);
                    
                    if (!bodyA.isStatic) {
                        bodyA.velocity.sub(impulse.clone().divideScalar(bodyA.mass));
                    }
                    
                    if (!bodyB.isStatic) {
                        bodyB.velocity.add(impulse.clone().divideScalar(bodyB.mass));
                    }
                    
                    const correction = Math.max(0, minDistance - distance) * 0.5;
                    const correctionVector = normal.clone().multiplyScalar(correction);
                    
                    if (!bodyA.isStatic) {
                        bodyA.object.position.sub(correctionVector);
                    }
                    
                    if (!bodyB.isStatic) {
                        bodyB.object.position.add(correctionVector);
                    }
                    
                    if (typeof bodyA.object.onCollision === 'function') {
                        bodyA.object.onCollision(bodyB.object, impulse.length());
                    }
                    
                    if (typeof bodyB.object.onCollision === 'function') {
                        bodyB.object.onCollision(bodyA.object, impulse.length());
                    }
                }
            }
        }
    }

    update(delta) {
        this.calculateGravitationalForces(delta);
        
        for (const body of this.physicsObjects) {
            if (body.isStatic) continue;
            
            if (body.thrusterForce.lengthSq() > 0) {
                const acceleration = body.thrusterForce.clone().divideScalar(body.mass);
                body.velocity.addScaledVector(acceleration, delta);
                body.thrusterForce.set(0, 0, 0);
            }
            
            if (body.thrusterTorque.lengthSq() > 0) {
                const angularAcceleration = new THREE.Vector3(
                    body.thrusterTorque.x / body.momentOfInertia.x,
                    body.thrusterTorque.y / body.momentOfInertia.y,
                    body.thrusterTorque.z / body.momentOfInertia.z
                );
                
                body.angularVelocity.addScaledVector(angularAcceleration, delta);
                body.thrusterTorque.set(0, 0, 0);
            }
            
            body.velocity.multiplyScalar(this.linearDamping);
            body.angularVelocity.multiplyScalar(this.rotationalDamping);
            
            body.object.position.addScaledVector(body.velocity, delta);
            
            const angularDelta = body.angularVelocity.clone().multiplyScalar(delta);
            
            if (angularDelta.lengthSq() > 0) {
                const axis = angularDelta.clone().normalize();
                const angle = angularDelta.length();
                
                const q = new THREE.Quaternion();
                q.setFromAxisAngle(axis, angle);
                
                body.object.quaternion.premultiply(q);
                body.object.quaternion.normalize();
            }
        }
        
        this.handleCollisions(delta);
    }

    getPhysicsBody(index) {
        return this.physicsObjects[index];
    }

    resetForces() {
        for (const body of this.physicsObjects) {
            body.thrusterForce.set(0, 0, 0);
            body.thrusterTorque.set(0, 0, 0);
        }
    }
}