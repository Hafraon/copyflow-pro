import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export interface ApiKeyData {
  id: string;
  teamId: string;
  permissions: string[];
  usageCount: number;
  isActive: boolean;
}

export async function validateApiKey(request: NextRequest): Promise<ApiKeyData | null> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const apiKey = authHeader.substring(7);

  try {
    const keyData = await prisma.apiKey.findUnique({
      where: { 
        key: apiKey,
        isActive: true 
      },
      include: {
        team: true
      }
    });

    if (!keyData) {
      return null;
    }

    // Update usage count and last used
    await prisma.apiKey.update({
      where: { id: keyData.id },
      data: {
        usageCount: keyData.usageCount + 1,
        lastUsed: new Date()
      }
    });

    return {
      id: keyData.id,
      teamId: keyData.teamId,
      permissions: JSON.parse(keyData.permissions),
      usageCount: keyData.usageCount,
      isActive: keyData.isActive
    };
  } catch (error) {
    console.error('API key validation error:', error);
    return null;
  }
}

export function hasPermission(apiKey: ApiKeyData, permission: string): boolean {
  return apiKey.permissions.includes(permission) || apiKey.permissions.includes('*');
}

export const RATE_LIMITS = {
  basic: { requests: 100, window: 3600 }, // 100 requests per hour
  premium: { requests: 1000, window: 3600 }, // 1000 requests per hour
  enterprise: { requests: 10000, window: 3600 } // 10000 requests per hour
};

export async function checkRateLimit(apiKeyId: string, plan: string): Promise<boolean> {
  const limit = RATE_LIMITS[plan as keyof typeof RATE_LIMITS] || RATE_LIMITS.basic;
  const windowStart = new Date(Date.now() - limit.window * 1000);

  const usageCount = await prisma.apiUsage.count({
    where: {
      apiKeyId,
      timestamp: {
        gte: windowStart
      }
    }
  });

  return usageCount < limit.requests;
}

export async function logApiUsage(
  apiKeyId: string,
  userId: string,
  endpoint: string,
  method: string,
  status: number
) {
  try {
    await prisma.apiUsage.create({
      data: {
        apiKeyId,
        userId,
        endpoint,
        method,
        status
      }
    });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}