import { NextResponse } from 'next/server';
import { PrismaClient } from '../../../generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const policyUrl = searchParams.get('policyUrl');
    
    let auditReport;
    
    // If no policy URL is provided, fetch the latest audit report (ID: 1)
    if (!policyUrl) {
      auditReport = await prisma.auditReport.findUnique({
        where: { id: 1 },
        include: { 
          section_scores: true,
          policy: true
        }
      });
    } else {
      // Decode the URL first
      const decodedPolicyUrl = decodeURIComponent(policyUrl);
      
      // For Facebook URLs, we'll check if it matches either the terms or privacy policy URL
      // All our inserted policies have the same terms URL
      let queryUrl = decodedPolicyUrl;
      
      // Handle common Facebook policy URLs
      if (decodedPolicyUrl.includes('facebook.com/privacy/policy')) {
        queryUrl = 'https://www.facebook.com/legal/terms';
      }
      
      // First, find the policy by URL
      const policy = await prisma.policy.findFirst({
        where: { 
          source_url: queryUrl
        }
      });
      
      if (!policy) {
        return NextResponse.json(
          { error: "No policy found for this URL" },
          { status: 404 }
        );
      }
      
      // Then, find the audit report for this policy
      auditReport = await prisma.auditReport.findFirst({
        where: { 
          policy_id: policy.id
        },
        include: { 
          section_scores: true,
          policy: true
        }
      });
    }
    
    if (!auditReport) {
      return NextResponse.json(
        { error: "No audit report found for this policy URL" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(auditReport);
  } catch (error) {
    console.error('Error fetching audit report data:', error);
    return NextResponse.json(
      { error: "Failed to fetch audit report data" },
      { status: 500 }
      );
    }
}

export async function POST(request: Request) {
  try {
    const { policyUrl } = await request.json();
    
    // For now, we'll just return the same data as GET
    // In a real implementation, this would trigger a new policy analysis
    
    // For Facebook URLs, we'll check if it matches either the terms or privacy policy URL
    // All our inserted policies have the same terms URL
    let queryUrl = policyUrl;
    
    // Handle common Facebook policy URLs
    if (policyUrl.includes('facebook.com/privacy/policy')) {
      queryUrl = 'https://www.facebook.com/legal/terms';
    }
    
    // First, find the policy by URL
    const policy = await prisma.policy.findFirst({
      where: { 
        source_url: queryUrl
      }
    });
    
    if (!policy) {
      return NextResponse.json(
        { error: "No policy found for this URL" },
        { status: 404 }
      );
    }
    
    // Then, find the audit report for this policy
    const auditReport = await prisma.auditReport.findFirst({
      where: { 
        policy_id: policy.id
      },
      include: { 
        section_scores: true,
        policy: true
      }
    });
    
    if (!auditReport) {
      // If no report exists for this URL, create a new one
      // For now, we'll just return an error message
      return NextResponse.json(
        { error: "No audit report found for this policy URL. In a full implementation, this would trigger a new analysis." },
        { status: 404 }
      );
    }
    
    return NextResponse.json(auditReport);
  } catch (error) {
    console.error('Error processing policy audit request:', error);
    return NextResponse.json(
      { error: "Failed to process policy audit request" },
      { status: 500 }
    );
  }
}
