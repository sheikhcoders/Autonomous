import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export const runtime = 'edge';

export async function POST() {
  try {
    const result = await redis.get('item');

    return NextResponse.json({ result });
  } catch (error) {
    console.error('Failed to fetch item from Redis:', error);

    return NextResponse.json(
      { error: 'Unable to fetch item from Redis.' },
      { status: 500 },
    );
  }
}
