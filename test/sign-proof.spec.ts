import { describe, expect, it } from '@jest/globals';
import { JSONSchemaType } from 'ajv';

import { generateKeyPair, signData, verifyData } from '../src';

describe('Sign data and verify', () => {
  describe('Object validation and verification', () => {
    it('Positive', () => {
      const schema: JSONSchemaType<{
        name: string;
        age: number;
        data: { some: boolean };
      }> = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
          data: {
            type: 'object',
            properties: {
              some: { type: 'boolean' },
            },
            required: ['some'],
          },
        },
        required: ['name', 'age', 'data'],
        additionalProperties: false,
      };

      const { publicKey, privateKey } = generateKeyPair();

      const person = { name: 'Alice', age: 30, data: { some: false } };

      const proof = signData(person, privateKey, { schema });

      console.log('proof', proof);
      const verified = verifyData(
        {
          proof,
          payload: person,
        },
        publicKey,
      );

      console.log('Verified:', verified);

      expect(verified).toBeTruthy();
    });
  });

  describe('String verification', () => {
    it('Positive', () => {
      const text = 'My safe text';
      const { publicKey, privateKey } = generateKeyPair();

      const proof = signData(text, privateKey);

      console.log('proof', proof);
      const verified = verifyData(
        {
          proof,
          payload: text,
        },
        publicKey,
      );

      console.log('Verified:', verified);

      expect(verified).toBeTruthy();
    });
  });

  describe('File verification', () => {
    it('Positive', () => {
      const fileBuffer = Buffer.from('Some binary content');

      const { publicKey, privateKey } = generateKeyPair();

      const proof = signData(fileBuffer, privateKey);

      console.log('proof', proof);
      const verified = verifyData(
        {
          proof,
          payload: fileBuffer,
        },
        publicKey,
      );

      console.log('Verified:', verified);

      expect(verified).toBeTruthy();
    });
  });
});
