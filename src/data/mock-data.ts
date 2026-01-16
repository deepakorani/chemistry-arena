import { Model } from '@/types';

// Available LLM models for chemistry benchmarking
export const MODELS: Model[] = [
  {
    id: 'gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    description: 'Latest GPT model with enhanced reasoning',
    isNew: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    description: 'Optimized multimodal GPT-4',
  },
  {
    id: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    description: 'Most capable Claude model',
    isNew: true,
  },
  {
    id: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: 'Balanced performance and speed',
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    description: 'Advanced reasoning model',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    description: 'Fast and efficient',
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    description: 'Reasoning-focused model',
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    description: 'General purpose model',
  },
  {
    id: 'llama-4-405b',
    name: 'Llama 4 405B',
    provider: 'Meta',
    description: 'Largest Llama model',
    isNew: true,
  },
  {
    id: 'mistral-large',
    name: 'Mistral Large 2',
    provider: 'Mistral',
    description: 'Flagship Mistral model',
  },
  {
    id: 'qwen-max',
    name: 'Qwen Max',
    provider: 'Alibaba',
    description: 'Leading Chinese LLM',
  },
  {
    id: 'grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    description: 'xAI flagship model',
    isNew: true,
  },
];
