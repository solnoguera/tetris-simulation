import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { installFakeAudio } from './fakeAudio'

beforeEach(installFakeAudio)

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})
