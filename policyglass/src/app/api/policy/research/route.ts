import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { PolicyController } from '../../../controllers/policy.controller';

export async function POST(request: NextRequest) {
  try {
    const result = await PolicyController.researchPolicy(request);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    
    return NextResponse.json(result, { status: 200 });
    
  } catch (error) {
    console.error('Policy research route error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
