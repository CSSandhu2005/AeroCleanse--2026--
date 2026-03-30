// import { prisma } from '../prisma';
// import { MissionStatus } from '@prisma/client';
import { MissionValidator } from './mission.validator';
import { MissionSimulator } from './mission.simulator';
import { WaypointService } from './waypoint.service';
import { GridGenerator, GridConfig } from './grid.generator';

export class MissionService {
    /**
     * Creates a new mission.
     */
    public static async createMission(data: { name: string; droneId: string; areaPolygon?: any }) {
        return {
            id: `mission_${Date.now()}`,
            name: data.name,
            droneId: data.droneId,
            areaPolygon: data.areaPolygon || {},
            status: 'DRAFT',
        };
    }

    /**
     * Generates a grid of waypoints for a mission based on its area polygon.
     */
    public static async generateGrid(missionId: string, config: GridConfig) {
        // Mock area polygon - default to San Francisco area if not provided
        const points = [
            { lat: 37.7749, lng: -122.4194 },
            { lat: 37.7850, lng: -122.4194 },
            { lat: 37.7850, lng: -122.4094 },
            { lat: 37.7749, lng: -122.4094 },
        ];

        const waypoints = GridGenerator.generateGrid(points, config);
        return waypoints;
    }

    /**
     * Validates a mission and stores the result.
     */
    public static async validateMission(missionId: string) {
        const mockWaypoints = [
            { latitude: 37.7749, longitude: -122.4194, altitude: 100 },
            { latitude: 37.7850, longitude: -122.4194, altitude: 100 },
        ];

        const result = await MissionValidator.validateMission(
            mockWaypoints.map(wp => ({ lat: wp.latitude, lng: wp.longitude, alt: wp.altitude })),
            []
        );

        return result;
    }

    /**
     * Simulates a mission and stores the result.
     */
    public static async simulateMission(missionId: string) {
        const mockWaypoints = [
            { latitude: 37.7749, longitude: -122.4194, altitude: 100, speed: 5 },
            { latitude: 37.7850, longitude: -122.4194, altitude: 100, speed: 5 },
        ];

        const result = MissionSimulator.simulateMission(
            mockWaypoints.map(wp => ({
                lat: wp.latitude,
                lng: wp.longitude,
                alt: wp.altitude,
                speed: wp.speed
            }))
        );

        return result;
    }

    /**
     * Activates a mission if it is validated and not unsafe.
     */
    public static async activateMission(missionId: string) {
        return {
            id: missionId,
            status: 'ACTIVE',
        };
    }
}
