import { defineAction } from 'astro:actions'
import { z } from 'astro/zod'
import {boardActions} from './boardActions.ts'

export const server = {
  getGreeting: defineAction({
    input: z.object({
      name: z.string(),
    }),
    handler: async (input) => {
      return `Hello, ${input.name}!`
    }
  }),
  boardActions,
}