"use client"

import { Navigate } from "react-router-dom"

export default function RejectedSamples() {
  return <Navigate to="/samples/sample-disposal" replace />
}
