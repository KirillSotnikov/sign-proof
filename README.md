# 📦 sign-proof

A lightweight Typescript library for cryptographically signing and verifying data (JSON, strings or Buffers) using Ed25519 signatures. Supports schema validation via `ajv` and embeds a self-contained proof block including a timestamp and MIME type.

## Features

* Ed25519 digital signature with `tweetnacl`
* JSON schema validation with `ajv`
* Includes timestamp (`signedAt`) and `mimeType` in signature
* Clean API for signing/verifying arbitrary data
* Built-in SHA-256 hash utility

---

## Installation

```bash
npm install sign-proof
```

---

## Usage

### Generate Key Pair

```ts
import { generateKeyPair } from 'sign-proof';

const { publicKey, privateKey } = generateKeyPair();
```

---

### Sign JSON with Schema validation

```ts
import { signData, verifyData, SignedData, JSONSchemaType } from 'sign-proof';

const schema: JSONSchemaType<{
    name: string;
    age: number;
}> = {
    type: 'object',
    properties: {
        name: { type: 'string' },
        age: { type: 'number' },
    },
    required: ['name', 'age'],
    additionalProperties: false,
};

const person = { name: 'Alice', age: 30, data: { some: false } };
const privateKey = '...'; // base64
const publicKey = '...';  // base64

const proof = signData(person, privateKey, { schema });

const signed: SignedData = { payload: person, proof };

const isValid = verifyData(signed, publicKey);
console.log('Verified?', isValid);
```

---

### Sign a Plain Text

```ts
import { signData, verifyData, SignedData } from 'sign-proof';

const text = 'Hello World!';

const privateKey = '...'; // base64
const publicKey = '...';  // base64

const proof = signData(text, privateKey);

const signed: SignedData = { payload: text, proof };

const isValid = verifyData(signed, publicKey);
console.log('Verified?', isValid);
```

---

### Sign a File Buffer

```ts
import { signData, verifyData, SignedData } from 'sign-proof';

const buffer = Buffer.from('Hello World!');

const privateKey = '...'; // base64
const publicKey = '...';  // base64

const proof = signData(buffer, privateKey);

const signed: SignedData = { payload: buffer, proof };

const isValid = verifyData(signed, publicKey);
console.log('Verified?', isValid);
```

---

### Hashing Utility

```ts
import { hashData } from 'sign-proof';

const hash = hashData({ foo: 'bar' })
console.log('SHA256:', hash);
```

---

## Proof Format

Each `SignedData<T>` consists of:

```ts
{
  payload: T;
  proof: {
    signature: string;   // base64 encoded
    signedAt: number;    // UNIX timestamp (ms)
    mimeType: string;    // inferred from payload
  };
}
```

---

## Technology Stack

* **TypeScript** – Static typing and generics
* **tweetnacl** – Ed25519 cryptographic signing
* **ajv** – Fast JSON Schema validator
* **crypto** – Node.js hashing utility

---

## License

MIT © 2025

---

## Author

Made by Kyrylo Sotnykov · [GitHub](https://github.com/KirillSotnikov)

