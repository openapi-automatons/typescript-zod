import {Openapi} from '@automatons/tools';
import {rm} from "node:fs/promises";
import {join} from "path";
import {expectFormat} from "../expects/expectFormat";
import {generate} from "../../generator";
import paths from "../../paths";

const outDir = join(paths.tmp, 'models');

it('should generate zod schemas for component models', async () => {
  await generate(openapi, {path: '', openapiPath: '', outDir});

  await expectFormat();
});

beforeEach(async () => {
  await rm(outDir, {recursive: true, force: true});
});

const openapi: Openapi = {
  openapi: '3.0.3',
  info: {
    title: 'example',
    version: '0.0.0'
  },
  paths: {},
  components: {
    schemas: {
      Category: {
        type: 'object',
        required: ['id'],
        properties: {
          id: {type: 'integer', format: 'int64'},
          name: {type: 'string'}
        }
      },
      Tag: {
        type: 'object',
        properties: {
          id: {type: 'integer'},
          name: {type: 'string'}
        }
      },
      Pet: {
        type: 'object',
        required: ['name', 'status'],
        properties: {
          id: {type: 'integer', format: 'int64'},
          name: {type: 'string', minLength: 1},
          category: {$ref: '#/components/schemas/Category'},
          photoUrls: {type: 'array', items: {type: 'string'}},
          tags: {type: 'array', items: {$ref: '#/components/schemas/Tag'}},
          status: {type: 'string', enum: ['available', 'pending', 'sold']},
          rating: {type: 'number', minimum: 0, maximum: 5},
          website: {type: 'string', format: 'url'},
          createdAt: {type: 'string', format: 'date-time'},
          metadata: {type: 'object', nullable: true}
        }
      },
      Dog: {
        allOf: [
          {$ref: '#/components/schemas/Pet'},
          {type: 'object', required: ['breed'], properties: {breed: {type: 'string'}}}
        ]
      },
      Animal: {
        oneOf: [
          {$ref: '#/components/schemas/Pet'},
          {$ref: '#/components/schemas/Category'}
        ]
      }
    }
  }
} as Openapi;
