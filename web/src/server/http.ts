import "server-only"
import { NextResponse } from "next/server"
import { ZodError } from "zod"
import { Prisma } from "@prisma/client"
import { ApiError, TransitionError } from "@/server/errors"

export function jsonError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Check the highlighted fields.", details: error.flatten() } },
      { status: 400 },
    )
  }
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message, details: error.details ?? null } },
      { status: error.status },
    )
  }
  if (error instanceof TransitionError) {
    return NextResponse.json(
      { error: { code: "INVALID_TRANSITION", message: error.message, details: null } },
      { status: 409 },
    )
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    return NextResponse.json(
      { error: { code: "CONFLICT", message: "That record already exists.", details: null } },
      { status: 409 },
    )
  }
  if (
    error instanceof Prisma.PrismaClientInitializationError ||
    (error instanceof Prisma.PrismaClientKnownRequestError && (error.code === "P1001" || error.code === "P1017"))
  ) {
    return NextResponse.json(
      {
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "The database is not running. Start Supabase, then sign in again.",
          details: null,
        },
      },
      { status: 503 },
    )
  }
  if (error instanceof Error && error.message.includes("JWT_SECRET")) {
    return NextResponse.json(
      {
        error: {
          code: "NOT_CONFIGURED",
          message: "Staff sign-in is not configured. Set JWT_SECRET in web/.env and restart the app.",
          details: null,
        },
      },
      { status: 500 },
    )
  }
  console.error(error)
  return NextResponse.json(
    { error: { code: "INTERNAL", message: "Something went wrong.", details: null } },
    { status: 500 },
  )
}
