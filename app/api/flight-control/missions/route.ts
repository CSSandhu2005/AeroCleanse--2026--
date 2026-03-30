import { NextResponse } from 'next/server';
import { MissionService } from '@/lib/flight/mission.service';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const CreateMissionSchema = z.object({
    name: z.string().min(3),
    droneId: z.string(),
    areaPolygon: z.object({
        points: z.array(z.object({
            lat: z.number(),
            lng: z.number()
        }))
    }).optional()
});

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("agrosentry");
        const missions = await db.collection("missions")
            .find({})
            .sort({ createdAt: -1 })
            .toArray();
        return NextResponse.json(missions);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const client = await clientPromise;
        const db = client.db("agrosentry");
        const body = await req.json();
        const validatedData = CreateMissionSchema.parse(body);

        const mission = {
            ...validatedData,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'pending'
        };

        const result = await db.collection("missions").insertOne(mission);
        return NextResponse.json({ ...mission, _id: result.insertedId }, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
