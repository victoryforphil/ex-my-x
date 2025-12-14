import { NextResponse } from 'next/server';
import { getTwitterClient } from '@/lib/twitter';

export async function GET() {
  try {
    const client = getTwitterClient();
    const user = await client.v2.me({
      'user.fields': ['profile_image_url', 'name', 'username', 'public_metrics'],
    });

    return NextResponse.json({
      id: user.data.id,
      name: user.data.name,
      username: user.data.username,
      profile_image_url: user.data.profile_image_url,
      public_metrics: user.data.public_metrics,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data', details: String(error) },
      { status: 500 }
    );
  }
}
