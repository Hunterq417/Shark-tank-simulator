import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'VentureFlow Investment Engine API',
    version: '1.0.0',
    description: 'Production-ready REST & Real-time Socket.io API for Live Pitching, Term Sheets, and AI Deal Analysis.'
  },
  servers: [
    {
      url: '/',
      description: 'Main Applet Server'
    }
  ],
  paths: {
    '/api/auth/register': {
      post: {
        summary: 'Register new user (Founder or Investor)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string', enum: ['Founder', 'Investor'] },
                  company: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '201': { description: 'User registered successfully with JWT tokens' }
        }
      }
    },
    '/api/auth/login': {
      post: {
        summary: 'Authenticate user and obtain JWT tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          '200': { description: 'JWT Access and Refresh Tokens returned' }
        }
      }
    },
    '/api/events/live': {
      get: {
        summary: 'Get active live pitch event, current metrics, and active bids',
        responses: {
          '200': { description: 'Live event payload' }
        }
      }
    },
    '/api/offers': {
      get: {
        summary: 'List active and historic term sheet offers',
        responses: {
          '200': { description: 'Array of offers' }
        }
      },
      post: {
        summary: 'Submit a new bid or term sheet offer',
        responses: {
          '201': { description: 'Offer created' }
        }
      }
    },
    '/api/deals/analyze': {
      post: {
        summary: 'Run AI Deal Analyzer rules-engine calculation on term sheet terms',
        responses: {
          '200': { description: 'Detailed financial analysis and valuation insights' }
        }
      }
    }
  }
};

export function setupSwagger(app: Express) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
