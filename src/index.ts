import crypto from 'crypto';

import { JSONSchemaType, Ajv } from 'ajv';
import * as nacl from 'tweetnacl';
import { decodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';

const ajv = new Ajv();

export { JSONSchemaType } from 'ajv';

export interface Proof {
    signature: string;
    signedAt: number;
    mimeType: string;
}

export interface SignedData<T = unknown> {
    payload: T;
    proof: Proof;
}

const inferMimeType = (payload: any): string => {
    if (typeof payload === 'string') return 'text/plain';
    if (Buffer.isBuffer(payload)) return 'application/octet-stream';
    if (typeof payload === 'object') return 'application/json';
    return 'application/octet-stream';
};

export const validateSchema = <T>(
    json: T,
    schema: JSONSchemaType<T>,
): boolean => {
    const validate = ajv.compile(schema);
    return validate(json) as boolean;
};

const prepareSignData = (data: string, timestamp: number, mimetype: string) =>
    `${data}::${timestamp}::${mimetype}`;

export const signData = <T>(
    payload: T,
    privateKeyBase64: string,
    options?: {
        schema?: JSONSchemaType<T>;
    },
): Proof => {
    const signedAt = Date.now();
    const mimeType = inferMimeType(payload);

    let rawData: string;

    if (typeof payload === 'string') {
        rawData = payload;
    } else if (Buffer.isBuffer(payload)) {
        rawData = payload.toString('utf-8');
    } else {
        if (options && options.schema) {
            if (!validateSchema(payload, options.schema)) {
                throw new Error('Invalid payload: does not match schema');
            }
        }
        rawData = JSON.stringify(payload);
    }

    const dataToSign = prepareSignData(rawData, signedAt, mimeType);

    const privateKey = decodeBase64(privateKeyBase64);
    const signature = nacl.sign.detached(decodeUTF8(dataToSign), privateKey);

    return {
        signature: encodeBase64(signature),
        signedAt,
        mimeType,
    };
};

export const verifyData = <T>(
    signed: SignedData<T>,
    publicKey: string,
): boolean => {
    let rawData: string;

    if (typeof signed.payload === 'string') {
        rawData = signed.payload;
    } else if (Buffer.isBuffer(signed.payload)) {
        rawData = signed.payload.toString('utf-8');
    } else {
        rawData = JSON.stringify(signed.payload);
    }

    const dataToVerify = prepareSignData(
        rawData,
        signed.proof.signedAt,
        signed.proof.mimeType,
    );

    const signature = decodeBase64(signed.proof.signature);
    const decodedPublicKey = decodeBase64(publicKey);

    return nacl.sign.detached.verify(
        decodeUTF8(dataToVerify),
        signature,
        decodedPublicKey,
    );
};

export const hashData = (data: string | Buffer | object): string => {
    const str =
        typeof data === 'string'
            ? data
            : Buffer.isBuffer(data)
                ? data.toString('utf-8')
                : JSON.stringify(data);

    return crypto.createHash('sha256').update(str).digest('hex');
};

export const generateKeyPair = (): {
    publicKey: string;
    privateKey: string;
} => {
    const keyPair = nacl.sign.keyPair();
    return {
        publicKey: encodeBase64(keyPair.publicKey),
        privateKey: encodeBase64(keyPair.secretKey),
    };
};
