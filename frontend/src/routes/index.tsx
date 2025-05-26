import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import DrawBoard from '../components/DrawBoard'

export const Route = createFileRoute('/')({
  component: HomeComponent,
})

function HomeComponent() {
  return (
    <div className="min-h-screen flex">
      <DrawBoard />
    </div>
  )
}
