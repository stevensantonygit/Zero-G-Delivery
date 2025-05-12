{
  "missionTypes": [
    {
      "type": "standard",
      "name": "Standard Delivery",
      "description": "Deliver cargo to the space station within the time limit.",
      "difficulty": 1,
      "baseReward": 1000,
      "timeLimit": 120
    },
    {
      "type": "urgent",
      "name": "Urgent Delivery",
      "description": "Critical supplies needed! Deliver quickly for bonus rewards.",
      "difficulty": 2,
      "baseReward": 2000,
      "timeLimit": 90
    },
    {
      "type": "hazardous",
      "name": "Hazardous Materials",
      "description": "Handle with extreme care. Cargo is unstable and sensitive to speed.",
      "difficulty": 3,
      "baseReward": 3000,
      "timeLimit": 150,
      "cargoSensitivity": 2.0
    },
    {
      "type": "stealth",
      "name": "Covert Operation",
      "description": "Avoid detection by patrol drones while delivering your cargo.",
      "difficulty": 4,
      "baseReward": 4000,
      "timeLimit": 180,
      "patrolDensity": 5
    }
  ],
  "environments": [
    {
      "id": "orbit",
      "name": "Earth Orbit",
      "description": "Navigate through satellite debris in low Earth orbit.",
      "obstacleTypes": ["satellite", "debris"],
      "obstacleDensity": 30,
      "backgroundStars": 2000,
      "lighting": {
        "ambient": "#333333",
        "directional": "#ffffff",
        "point": "#0088ff"
      }
    },
    {
      "id": "asteroid",
      "name": "Asteroid Belt",
      "description": "Maneuver through a dense asteroid field.",
      "obstacleTypes": ["asteroid"],
      "obstacleDensity": 50,
      "backgroundStars": 1500,
      "lighting": {
        "ambient": "#222222",
        "directional": "#ffeecc",
        "point": "#ff8800"
      }
    },
    {
      "id": "nebula",
      "name": "Cosmic Nebula",
      "description": "Navigate through a colorful but hazardous nebula with limited visibility.",
      "obstacleTypes": ["gasCloud", "energyVortex"],
      "obstacleDensity": 15,
      "backgroundStars": 500,
      "fogDensity": 0.03,
      "lighting": {
        "ambient": "#552255",
        "directional": "#ff00ff",
        "point": "#00ffff"
      }
    },
    {
      "id": "blackhole",
      "name": "Event Horizon",
      "description": "Deliver close to a black hole with intense gravitational effects.",
      "obstacleTypes": ["gravityWell", "hawkingRadiation"],
      "obstacleDensity": 10,
      "backgroundStars": 3000,
      "gravitationalConstant": 2.5,
      "lighting": {
        "ambient": "#111111",
        "directional": "#aaaaaa",
        "point": "#9900ff"
      }
    }
  ],
  "destinations": [
    {
      "id": "station",
      "name": "Orbital Station Alpha",
      "description": "Standard space station for routine deliveries.",
      "dockingDifficulty": 1,
      "model": "station"
    },
    {
      "id": "research",
      "name": "Deep Space Research Lab",
      "description": "Remote research facility studying cosmic phenomena.",
      "dockingDifficulty": 2,
      "model": "research"
    },
    {
      "id": "mining",
      "name": "Asteroid Mining Operation",
      "description": "Resource extraction facility on a large asteroid.",
      "dockingDifficulty": 3,
      "model": "mining"
    },
    {
      "id": "military",
      "name": "Military Outpost",
      "description": "Heavily defended military facility with strict approach protocols.",
      "dockingDifficulty": 4,
      "model": "military",
      "approachVector": {
        "enabled": true,
        "margin": 15
      }
    }
  ],
  "spacecraft": [
    {
      "id": "shuttle",
      "name": "Cargo Shuttle",
      "description": "Basic spacecraft with balanced capabilities.",
      "speed": 1.0,
      "maneuverability": 1.0,
      "fuelCapacity": 100,
      "fuelConsumption": 0.05,
      "cargoCapacity": 1000
    },
    {
      "id": "speedster",
      "name": "Swift Courier",
      "description": "Fast but fragile ship with limited fuel capacity.",
      "speed": 1.5,
      "maneuverability": 1.2,
      "fuelCapacity": 75,
      "fuelConsumption": 0.08,
      "cargoCapacity": 500
    },
    {
      "id": "hauler",
      "name": "Heavy Hauler",
      "description": "Slow but sturdy ship with excellent fuel efficiency.",
      "speed": 0.7,
      "maneuverability": 0.6,
      "fuelCapacity": 150,
      "fuelConsumption": 0.03,
      "cargoCapacity": 2000
    },
    {
      "id": "stealth",
      "name": "Ghost Runner",
      "description": "Specialized ship with stealth capabilities but average stats.",
      "speed": 1.1,
      "maneuverability": 1.0,
      "fuelCapacity": 90,
      "fuelConsumption": 0.06,
      "cargoCapacity": 750,
      "stealthRating": 0.7
    }
  ],
  "cargoTypes": [
    {
      "id": "standard",
      "name": "Standard Supplies",
      "description": "Basic materials and supplies.",
      "value": 1.0,
      "fragility": 0.5,
      "size": 1.0
    },
    {
      "id": "medical",
      "name": "Medical Supplies",
      "description": "Critical medical equipment and medicines.",
      "value": 2.0,
      "fragility": 0.8,
      "size": 0.7,
      "urgency": 1.5
    },
    {
      "id": "hazardous",
      "name": "Hazardous Materials",
      "description": "Dangerous materials requiring careful handling.",
      "value": 3.0,
      "fragility": 1.0,
      "size": 1.2,
      "handlingRequirements": {
        "maxAcceleration": 0.5,
        "maxSpeed": 0.7
      }
    },
    {
      "id": "luxury",
      "name": "Luxury Goods",
      "description": "High-value items for affluent colonists.",
      "value": 4.0,
      "fragility": 0.9,
      "size": 0.5
    },
    {
      "id": "data",
      "name": "Classified Data",
      "description": "Sensitive information requiring secure transport.",
      "value": 5.0,
      "fragility": 0.3,
      "size": 0.2,
      "securityLevel": 5
    }
  ],
  "upgrades": [
    {
      "id": "engine1",
      "name": "Enhanced Thrusters",
      "description": "Increase maximum speed by 20%.",
      "cost": 2000,
      "effects": {
        "maxSpeed": 1.2
      }
    },
    {
      "id": "maneuvering1",
      "name": "Precision Maneuvering Jets",
      "description": "Improve handling and rotation speed by 25%.",
      "cost": 2500,
      "effects": {
        "angularThrusterPower": 1.25
      }
    },
    {
      "id": "fuel1",
      "name": "Extended Fuel Tanks",
      "description": "Increase fuel capacity by 30%.",
      "cost": 1800,
      "effects": {
        "fuelCapacity": 1.3
      }
    },
    {
      "id": "efficiency1",
      "name": "Efficient Propulsion",
      "description": "Reduce fuel consumption by 20%.",
      "cost": 3000,
      "effects": {
        "fuelConsumptionRate": 0.8
      }
    },
    {
      "id": "shields1",
      "name": "Impact Shields",
      "description": "Provide protection against minor collisions.",
      "cost": 5000,
      "effects": {
        "collisionProtection": 1
      }
    },
    {
      "id": "braking1",
      "name": "Emergency Brakes",
      "description": "Reduce emergency stop fuel consumption by 50%.",
      "cost": 1500,
      "effects": {
        "emergencyStopCost": 0.5
      }
    }
  ]
}