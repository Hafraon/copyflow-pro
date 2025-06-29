import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hasTeamPermission } from '@/lib/team-roles';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const createKeySchema = z.object({
  name: z.string().min(1, 'Key name is required'),
  permissions: z.array(z.string()).min(1, 'At least one permission is required')
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Check team membership and permissions
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id
      }
    });

    if (!teamMember || !hasTeamPermission(teamMember.role as any, 'api:manage')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Get API keys for the team
    const apiKeys = await prisma.apiKey.findMany({
      where: { teamId },
      select: {
        id: true,
        name: true,
        key: true,
        permissions: true,
        usageCount: true,
        lastUsed: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedKeys = apiKeys.map(key => ({
      ...key,
      permissions: JSON.parse(key.permissions),
      key: key.key.substring(0, 8) + '...' // Mask the key for security
    }));

    return NextResponse.json(formattedKeys);

  } catch (error) {
    console.error('API keys fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, permissions } = createKeySchema.parse(body);
    const teamId = body.teamId;

    if (!teamId) {
      return NextResponse.json(
        { error: 'Team ID is required' },
        { status: 400 }
      );
    }

    // Check team membership and permissions
    const teamMember = await prisma.teamMember.findFirst({
      where: {
        teamId,
        userId: session.user.id
      }
    });

    if (!teamMember || !hasTeamPermission(teamMember.role as any, 'api:manage')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Generate API key
    const apiKey = `cf_${uuidv4().replace(/-/g, '')}`;

    // Create API key
    const newKey = await prisma.apiKey.create({
      data: {
        name,
        key: apiKey,
        permissions: JSON.stringify(permissions),
        teamId
      }
    });

    return NextResponse.json({
      id: newKey.id,
      name: newKey.name,
      key: apiKey, // Return full key only on creation
      permissions,
      createdAt: newKey.createdAt
    });

  } catch (error) {
    console.error('API key creation error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const keyId = searchParams.get('keyId');

    if (!keyId) {
      return NextResponse.json(
        { error: 'Key ID is required' },
        { status: 400 }
      );
    }

    // Get API key and check permissions
    const apiKey = await prisma.apiKey.findUnique({
      where: { id: keyId },
      include: {
        team: {
          include: {
            members: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });

    if (!apiKey || !apiKey.team.members[0] || !hasTeamPermission(apiKey.team.members[0].role as any, 'api:manage')) {
      return NextResponse.json(
        { error: 'API key not found or insufficient permissions' },
        { status: 404 }
      );
    }

    // Delete API key
    await prisma.apiKey.delete({
      where: { id: keyId }
    });

    return NextResponse.json({ message: 'API key deleted successfully' });

  } catch (error) {
    console.error('API key deletion error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}