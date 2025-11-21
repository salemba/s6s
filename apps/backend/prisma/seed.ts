import { PrismaClient, CredentialScope } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

// Mock encryption setup
const MASTER_KEY_HEX = process.env.MASTER_KEY || '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f';
const MASTER_KEY = Buffer.from(MASTER_KEY_HEX, 'hex');

function mockEncrypt(text: string) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', MASTER_KEY, iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  
  return {
    iv,
    authTag,
    cipherText: encrypted
  };
}

async function main() {
  const email = 'admin@s6s.com';
  const password = 'Admin124!';
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
    },
    create: {
      email,
      password: hashedPassword,
      displayName: 'System Admin',
    },
  });

  console.log({ user });

  // Seed Credentials
  const credentialsData = [
    {
      name: "Prod DB",
      type: "POSTGRES_DB",
      value: JSON.stringify({ host: "prod-db.internal", user: "admin", pass: "super_secret_db_pass" }),
      isQuantum: false
    },
    {
      name: "Corporate Mail Relay",
      type: "EMAIL_SENDER",
      value: JSON.stringify({ host: "smtp.corp.com", port: 587, auth: "user:pass" }),
      isQuantum: false
    },
    {
      name: "Data Lake Access",
      type: "CLOUD_STORAGE",
      value: JSON.stringify({ accessKey: "AKIAIOSFODNN7EXAMPLE", secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" }),
      isQuantum: false
    },
    {
      name: "GPT-4 API",
      type: "LLM_QUERY",
      value: JSON.stringify({ apiKey: "sk-proj-1234567890abcdef1234567890abcdef" }),
      isQuantum: false
    },
    {
      name: "Top Secret Keys",
      type: "API_KEY",
      value: JSON.stringify({ key: "quantum_protected_secret_payload_v2" }),
      isQuantum: true
    }
  ];

  console.log('Seeding credentials...');
  
  for (const cred of credentialsData) {
    const encrypted = mockEncrypt(cred.value);
    
    // Check if credential already exists to avoid duplicates on re-seed
    const existing = await prisma.credential.findFirst({
      where: { 
        name: cred.name,
        userId: user.id
      }
    });

    if (!existing) {
      await prisma.credential.create({
        data: {
          name: cred.name,
          scope: CredentialScope.USER, // Scoped to the admin user
          userId: user.id,
          cipherText: encrypted.cipherText,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
          metaJson: { type: cred.type },
          isQuantum: cred.isQuantum,
          // Mock Kyber ciphertext (1568 bytes for Kyber-1024)
          kyberCipher: cred.isQuantum ? crypto.randomBytes(1568) : null, 
        }
      });
      console.log(`Created credential: ${cred.name}`);
    } else {
      console.log(`Credential already exists: ${cred.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
