import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const policyId = parseInt(params.id);
    
    if (isNaN(policyId)) {
      return NextResponse.json({ error: 'Invalid policy ID' }, { status: 400 });
    }

    const policy = await prisma.policy.findUnique({
      where: { id: policyId },
      include: {
        audit_reports: {
          include: {
            section_scores: true,
          },
        },
      },
    });

    if (!policy) {
      return NextResponse.json({ error: 'Policy not found' }, { status: 404 });
    }

    return NextResponse.json(policy, { status: 200 });

  } catch (error) {
    console.error('Policy fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
