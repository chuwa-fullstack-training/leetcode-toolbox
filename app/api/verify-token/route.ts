import { tokenService } from '@/services/tokenService';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Extract token from URL
  const token = request.nextUrl.searchParams.get('token');
  
  if (!token) {
    return NextResponse.json(
      { error: 'Token parameter is required' },
      { status: 400 }
    );
  }
  
  try {
    // Verify token is valid
    const isValid = await tokenService.verifyToken(token);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }
    
    // Get token data to return email
    const tokenData = await tokenService.getTokenData(token);
    
    if (!tokenData) {
      return NextResponse.json(
        { error: 'Token data not found' },
        { status: 400 }
      );
    }
    
    // Return the email associated with the token
    return NextResponse.json({
      valid: true,
      email: tokenData.email
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify token' },
      { status: 500 }
    );
  }
}