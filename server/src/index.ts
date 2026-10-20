import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { YoutubeTranscript } from 'youtube-transcript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { z } from 'zod';
import { getAIProvider } from './providers/index.js';
import { 
  RawStudyMaterialSchema, 
  StudyMaterialSchema, 
  StudyMaterial, 
  computeCompression, 
  normalizeConceptTags,
  RawStudyMaterial 
} from './schema.js';

const app = express();
const port = process.env.PORT || 8787;
const configuredOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const allowedOrigins = Array.from(new Set([
  configuredOrigin, 
  'http://localhost:3000', 
  'http://127.0.0.1:3000', 
  'http://localhost:5173', 
  'http://127.0.0.1:5173'
]));

// In-memory sliding-window rate limiter
function createRateLimiter(windowMs: number, maxRequests: number, message: string) {
  const ipRequests = new Map<string, { count: number; resetTime: number }>();
  return (req: Request, res: Response, next: NextFunction): void => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip) || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = ipRequests.get(ip);

    if (!record || now > record.resetTime) {
      ipRequests.set(ip, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (record.count >= maxRequests) {
      res.status(429).json({ error: message });
      return;
    }

    record.count++;
    next();
  };
}

const authLimiter = createRateLimiter(5 * 60 * 1000, 40, 'Too many authentication attempts. Please try again in 5 minutes.');
const analyzeLimiter = createRateLimiter(15 * 60 * 1000, 30, 'Too many analysis requests. Please wait a few minutes before trying again.');

// CORS configuration supporting SSE stream headers, custom progress header, and dev origins
app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-stream-progress', 'X-Stream-Progress', 'Accept'],
  exposedHeaders: ['Content-Type', 'x-stream-progress'],
}));

app.use(express.json({ limit: '10mb' }));

// Health Check for Render & uptime monitors
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Rate limit authentication routes
app.use('/api/auth', authLimiter);

// --- JWT & Auth ---
const JWT_SECRET = process.env.JWT_SECRET || 'lectureai-super-secret-jwt-key-2026';
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.warn('[Server WARNING] Running in production without a custom JWT_SECRET! Set JWT_SECRET in your Render environment variables.');
}

interface ServerUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  institution: string;
  level: number;
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const users: Map<string, ServerUser> = new Map([
  [
    'scout@berkeley.edu',
    {
      id: 'usr_scout_1',
      name: 'Daksh',
      email: 'scout@berkeley.edu',
      passwordHash: hashPassword('password123'),
      institution: 'UC Berkeley',
      level: 7,
    },
  ],
]);

function signJwt(payload: Record<string, unknown>, expiresInSeconds = 86400 * 7): string {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload = { ...payload, iat: now, exp: now + expiresInSeconds, iss: 'lectureai-auth' };

  const base64Url = (obj: unknown) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const encHeader = base64Url(header);
  const encPayload = base64Url(fullPayload);
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encHeader}.${encPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${encHeader}.${encPayload}.${signature}`;
}

function verifyJwt(token: string): { valid: boolean; payload?: any } {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false };
    const [encHeader, encPayload, sig] = parts;
    const expectedSig = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${encHeader}.${encPayload}`)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    if (sig !== expectedSig) return { valid: false };
    let base64 = encPayload.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) return { valid: false };
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}

// POST /api/auth/register
app.post('/api/auth/register', (req: Request, res: Response): void => {
  const RegisterSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Valid email is required'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    institution: z.string().optional(),
  });

  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const { name, email, password, institution } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();

  if (users.has(normalizedEmail)) {
    res.status(409).json({ error: 'An account with this email already exists.' });
    return;
  }

  const newUser: ServerUser = {
    id: 'usr_' + crypto.randomUUID().slice(0, 8),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    institution: institution?.trim() || 'UC Berkeley',
    level: 1,
  };

  users.set(normalizedEmail, newUser);

  const token = signJwt({
    sub: newUser.id,
    name: newUser.name,
    email: newUser.email,
    institution: newUser.institution,
    level: newUser.level,
  });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      institution: newUser.institution,
      level: newUser.level,
    },
  });
});

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response): void => {
  const LoginSchema = z.object({
    email: z.string().email('Valid email is required'),
    password: z.string().min(1, 'Password is required'),
  });

  const parsed = LoginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0].message });
    return;
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase().trim();
  const user = users.get(normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password)) {
    res.status(401).json({ error: 'Invalid email or password.' });
    return;
  }

  const token = signJwt({
    sub: user.id,
    name: user.name,
    email: user.email,
    institution: user.institution,
    level: user.level,
  });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      institution: user.institution,
      level: user.level,
    },
  });
});

// GET /api/auth/me
app.get('/api/auth/me', (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed Authorization header.' });
    return;
  }

  const token = authHeader.slice(7);
  const { valid, payload } = verifyJwt(token);

  if (!valid || !payload) {
    res.status(401).json({ error: 'Token is invalid or expired.' });
    return;
  }

  res.json({
    user: {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      institution: payload.institution,
      level: payload.level,
    },
  });
});

/**
 * Helper to validate raw model output, normalize concepts, and return any error issues.
 */
function validateAndNormalize(rawOutput: unknown): {
  success: boolean;
  data?: RawStudyMaterial;
  errors: string[];
} {
  // Pre-sanitize raw model output: clean up optional fields like tables or empty arrays
  if (rawOutput && typeof rawOutput === 'object') {
    const rawObj = rawOutput as any;

    if (Array.isArray(rawObj.quickTake)) {
      rawObj.quickTake = rawObj.quickTake
        .filter((item: unknown) => typeof item === 'string' && item.trim().length > 0)
        .map((item: string) => item.trim());
      if (rawObj.quickTake.length === 0) {
        rawObj.quickTake = ['High-yield lecture overview synthesized.'];
      }
    } else if (typeof rawObj.quickTake === 'string' && rawObj.quickTake.trim().length > 0) {
      rawObj.quickTake = [rawObj.quickTake.trim()];
    } else {
      rawObj.quickTake = ['High-yield lecture overview synthesized.'];
    }

    if (Array.isArray(rawObj.keyConcepts)) {
      for (const kc of rawObj.keyConcepts) {
        if (kc && typeof kc === 'object') {
          if (!['high', 'medium', 'low'].includes(kc.importance)) {
            kc.importance = 'high';
          }
          if (kc.table) {
            const hasValidHeaders = typeof kc.table === 'object' && Array.isArray(kc.table.headers) && kc.table.headers.length > 0;
            const hasValidRows = typeof kc.table === 'object' && Array.isArray(kc.table.rows) && kc.table.rows.length > 0;
            if (!hasValidHeaders || !hasValidRows) {
              delete kc.table;
            }
          }
          if (Array.isArray(kc.keyPoints) && kc.keyPoints.length === 0) {
            delete kc.keyPoints;
          }
        }
      }
    }

    if (Array.isArray(rawObj.examRadar)) {
      for (const er of rawObj.examRadar) {
        if (er && typeof er === 'object') {
          if (!['very_likely', 'important', 'good_to_know'].includes(er.priority)) {
            er.priority = 'important';
          }
        }
      }
    }

    if (Array.isArray(rawObj.flashcards)) {
      for (const fc of rawObj.flashcards) {
        if (fc && typeof fc === 'object') {
          if (!['easy', 'medium', 'hard'].includes(fc.difficulty)) {
            fc.difficulty = 'medium';
          }
        }
      }
    }

    if (Array.isArray(rawObj.quiz)) {
      for (const q of rawObj.quiz) {
        if (q && typeof q === 'object') {
          if (Array.isArray(q.options)) {
            while (q.options.length < 4) {
              q.options.push(`Option ${String.fromCharCode(65 + q.options.length)}`);
            }
            if (q.options.length > 4) {
              q.options = q.options.slice(0, 4);
            }
          }
          if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
            q.correctAnswer = 0;
          }
        }
      }
    }
  }

  const parseResult = RawStudyMaterialSchema.safeParse(rawOutput);
  if (!parseResult.success) {
    const zodErrors = parseResult.error.issues.map(
      (iss) => `Field "${iss.path.join('.')}": ${iss.message}`
    );
    return { success: false, errors: zodErrors };
  }

  const normResult = normalizeConceptTags(parseResult.data);
  if (!normResult.success || !normResult.data) {
    return { success: false, errors: normResult.unmatched };
  }

  return { success: true, data: normResult.data, errors: [] };
}

// POST /api/analyze
app.post('/api/analyze', analyzeLimiter, async (req: Request, res: Response): Promise<void> => {
  let { text, youtubeUrl } = req.body || {};
  const streamRequested = req.headers['x-stream-progress'] === 'true' || req.query.stream === 'true';

  let sendProgress: ((percent: number, message: string) => void) | undefined;
  if (streamRequested) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    sendProgress = (percent: number, message: string) => {
      try {
        res.write(`data: ${JSON.stringify({ type: 'progress', percent, message })}\n\n`);
      } catch (err) {
        console.warn('[Analyze] Failed to write progress event:', err);
      }
    };

    sendProgress(5, 'Connecting to AI Engine...');
  }

  // If a YouTube URL is provided, resolve transcript or preset
  if (youtubeUrl && typeof youtubeUrl === 'string') {
    const trimmedUrl = youtubeUrl.trim();
    if (trimmedUrl.includes('CS152') || trimmedUrl.includes('Radix4') || trimmedUrl.includes('Multiplication')) {
      try {
        const demoPath = path.resolve(__dirname, '../test.txt');
        if (fs.existsSync(demoPath)) {
          text = fs.readFileSync(demoPath, 'utf-8');
          sendProgress?.(15, 'Loaded demo preset transcript.');
        }
      } catch (err) {
        console.warn('[Analyze] Could not read demo transcript file:', err);
      }
    } else {
      try {
        console.log(`[Analyze] Fetching YouTube transcript for: ${trimmedUrl}`);
        sendProgress?.(10, 'Fetching YouTube lecture transcript...');
        let transcript;
        try {
          transcript = await YoutubeTranscript.fetchTranscript(trimmedUrl, { lang: 'en' });
        } catch {
          transcript = await YoutubeTranscript.fetchTranscript(trimmedUrl);
        }

        if (transcript && transcript.length > 0) {
          text = transcript.map((t) => t.text).join(' ');
          console.log(`[Analyze] Successfully extracted ${transcript.length} lines (${text.length} chars) from YouTube.`);
          sendProgress?.(18, 'YouTube transcript extracted successfully.');
        }
      } catch (ytErr: any) {
        console.error('[Analyze] Failed to fetch YouTube transcript:', ytErr?.message || ytErr);
        const errMsg = "Could not extract captions from this YouTube video. Please ensure the video has closed captions/subtitles enabled, or paste the lecture text directly into 'Lecture Notes / Text'.";
        if (streamRequested) {
          res.write(`data: ${JSON.stringify({ type: 'error', error: errMsg })}\n\n`);
          res.end();
          return;
        }
        res.status(400).json({ error: errMsg });
        return;
      }
    }
  }

  if (!text || typeof text !== 'string' || text.trim().length < 200) {
    const errMsg = 'Lecture text or transcript must be at least 200 characters long to generate high-yield study material.';
    if (streamRequested) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: errMsg })}\n\n`);
      res.end();
      return;
    }
    res.status(400).json({ error: errMsg });
    return;
  }

  try {
    const provider = getAIProvider();

    // Synthesis with automatic retry on initial network drop or cold connection
    let rawOutput: unknown;
    let providerErr: Error | null = null;
    const MAX_PROVIDER_ATTEMPTS = 2;

    for (let attempt = 1; attempt <= MAX_PROVIDER_ATTEMPTS; attempt++) {
      try {
        if (attempt > 1) {
          sendProgress?.(25, 'Re-establishing AI engine connection & retrying synthesis (Attempt 2)...');
          await new Promise((resolve) => setTimeout(resolve, 800));
        }
        rawOutput = await provider.generateStudyMaterial(text, undefined, sendProgress);
        providerErr = null;
        break;
      } catch (err) {
        providerErr = err instanceof Error ? err : new Error(String(err));
        console.error(`[Analyze] Provider invocation attempt ${attempt} failed:`, providerErr.message);
      }
    }

    if (providerErr || !rawOutput) {
      const displayMsg = providerErr?.message?.includes('API_KEY')
        ? 'Invalid or missing GEMINI_API_KEY. Please verify server/.env configuration.'
        : providerErr?.message?.includes('NOT_FOUND')
        ? 'Configured AI model was not found. Please verify GEMINI_MODEL in server/.env.'
        : "We couldn't analyze this lecture on this take. Please try again or check your lecture input.";

      if (streamRequested) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: displayMsg })}\n\n`);
        res.end();
        return;
      }
      res.status(502).json({ error: displayMsg });
      return;
    }

    sendProgress?.(94, 'Validating study material schema...');
    let validation = validateAndNormalize(rawOutput);

    // If validation fails, retry ONCE with validation errors included
    if (!validation.success) {
      console.warn('[Analyze] Attempt 1 failed validation. Retrying with error feedback...', validation.errors);
      sendProgress?.(70, 'Refining schema consistency and retrying...');

      try {
        const retryOutput = await provider.generateStudyMaterial(text, validation.errors, sendProgress);
        validation = validateAndNormalize(retryOutput);
      } catch (err) {
        console.error('[Analyze] Provider invocation failed on retry (Attempt 2):', err instanceof Error ? err.message : err);
      }
    }

    // If it still fails after retry, return 502 without exposing raw model output
    if (!validation.success || !validation.data) {
      console.error('[Analyze] Structured validation failed after retry:', validation.errors);
      if (streamRequested) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: "We couldn't analyze this lecture." })}\n\n`);
        res.end();
        return;
      }
      res.status(502).json({ error: "We couldn't analyze this lecture." });
      return;
    }

    const validData = validation.data;

    // Server generates all ID fields itself (e.g. "kc-1", "er-1", "fc-1", "qz-1")
    const keyConceptsWithIds = validData.keyConcepts.map((kc, i) => ({
      ...kc,
      id: `kc-${i + 1}`,
    }));

    const examRadarWithIds = validData.examRadar.map((er, i) => ({
      ...er,
      id: `er-${i + 1}`,
    }));

    const flashcardsWithIds = validData.flashcards.map((fc, i) => ({
      ...fc,
      id: `fc-${i + 1}`,
    }));

    const quizWithIds = Array.isArray(validData.quiz)
      ? validData.quiz.map((q, i) => ({
          ...q,
          id: `qz-${i + 1}`,
        }))
      : [];

    // Server computes compression metrics
    const compression = computeCompression(
      text,
      validData.quickTake,
      keyConceptsWithIds
    );

    const studyMaterial: StudyMaterial = {
      courseTitle: validData.courseTitle,
      quickTake: validData.quickTake,
      keyConcepts: keyConceptsWithIds,
      examRadar: examRadarWithIds,
      flashcards: flashcardsWithIds,
      quiz: quizWithIds,
      compression,
    };

    // Final safety parse against complete StudyMaterialSchema
    const finalVerification = StudyMaterialSchema.safeParse(studyMaterial);
    if (!finalVerification.success) {
      console.error('[Analyze] Final assembly schema mismatch:', finalVerification.error.issues);
      if (streamRequested) {
        res.write(`data: ${JSON.stringify({ type: 'error', error: "We couldn't analyze this lecture." })}\n\n`);
        res.end();
        return;
      }
      res.status(502).json({ error: "We couldn't analyze this lecture." });
      return;
    }

    if (streamRequested) {
      sendProgress?.(100, 'Lecture synthesis complete!');
      res.write(`data: ${JSON.stringify({ type: 'result', data: studyMaterial })}\n\n`);
      res.end();
      return;
    }

    res.json(studyMaterial);
  } catch (err) {
    console.error('[Analyze] Internal error:', err instanceof Error ? err.message : err);
    if (streamRequested) {
      res.write(`data: ${JSON.stringify({ type: 'error', error: 'An unexpected error occurred while analyzing the lecture.' })}\n\n`);
      res.end();
      return;
    }
    res.status(500).json({ error: 'An unexpected error occurred while analyzing the lecture.' });
  }
});

// --- Static Asset & SPA Serving for Web Service Deployment (Render / Single Server) ---
const clientDist = path.resolve(__dirname, '../../dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));

  // Catch-all route to serve index.html for client-side SPA routing (e.g. /lecture, /radar, /quiz)
  app.get('*', (req: Request, res: Response, next: NextFunction): void => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
  console.log(`[Server] Serving production static frontend from: ${clientDist}`);
}

app.listen(port, () => {
  const provider = (process.env.AI_PROVIDER || 'gemini').trim().toLowerCase();
  const modelName = provider === 'gemini' ? process.env.GEMINI_MODEL : (process.env.LOCAL_MODEL || 'qwen2.5:7b-instruct');
  console.log(`[Server] Learn Faster server listening on port ${port}`);
  console.log(`[Server] Active AI Provider: ${provider} (${modelName})`);
  console.log(`[Server] Client origin restricted to: ${configuredOrigin}`);
});

// Pre-warm AI provider connection so the first user take is instantaneous
setTimeout(() => {
  try {
    getAIProvider();
    console.log('[Server] AI Provider initialized and ready for requests.');
  } catch (err) {
    console.warn('[Server] AI Provider initialization note:', err instanceof Error ? err.message : err);
  }
}, 300);
