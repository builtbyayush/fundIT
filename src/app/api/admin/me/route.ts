import { NextResponse } from "next/server";

import { UserRole } from "@/constants/roles";
import { AuthError, requireRole } from "@/lib/auth/guards";
import { errorResponse, successResponse } from "@/lib/api";

export async function GET() {
  try {
    const user = await requireRole(UserRole.ADMIN);
    return NextResponse.json(
      successResponse({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      }),
    );
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json(
        errorResponse(error.message, error.code),
        { status: error.statusCode },
      );
    }

    return NextResponse.json(
      errorResponse("An unexpected error occurred", "INTERNAL_ERROR"),
      { status: 500 },
    );
  }
}
