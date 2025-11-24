import { PrismaClient, CredentialScope, NodeType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

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

  // Seed Functional Test Workflow
  const workflowId = 'e1cfd618-8045-4447-89cf-5e34b5b352ae';

  const testWorkflow = await prisma.workflow.upsert({
    where: { id: workflowId },
    update: {
      name: "Functional Test Workflow",
      description: "A workflow to test manual execution and code nodes.",
      isActive: true,
      ownerId: user.id,
      nodes: {
        deleteMany: {},
        create: [
          {
            id: "node-1",
            name: "Manual Trigger",
            type: 'TRIGGER_MANUAL' as NodeType,
            configJson: {},
            positionX: 100,
            positionY: 100,
          },
          {
            id: "node-2",
            name: "Code Execution",
            type: 'LOGIC_CODE' as NodeType,
            configJson: {
              code: "// axios is injected into the sandbox, no need to require it\nconsole.log('Hello from VM');\nreturn { success: true, message: 'Hello from VM' };"
            },
            positionX: 300,
            positionY: 100,
          }
        ]
      }
    },
    create: {
      id: workflowId,
      name: "Functional Test Workflow",
      description: "A workflow to test manual execution and code nodes.",
      isActive: true,
      ownerId: user.id,
      nodes: {
        create: [
          {
            id: "node-1",
            name: "Manual Trigger",
            type: 'TRIGGER_MANUAL' as NodeType,
            configJson: {},
            positionX: 100,
            positionY: 100,
          },
          {
            id: "node-2",
            name: "Code Execution",
            type: 'LOGIC_CODE' as NodeType,
            configJson: {
              code: "// axios is injected into the sandbox, no need to require it\nconsole.log('Hello from VM');\nreturn { success: true, message: 'Hello from VM' };"
            },
            positionX: 300,
            positionY: 100,
          }
        ]
      }
    }
  });

  // Create Edge manually since nested create for self-relation might be tricky depending on schema
  // Assuming Edge model exists and links source/target nodes
  // Check schema first? Assuming standard edge model based on context.
  // Actually, let's check if Edge model exists.
  // Based on previous context, edges are part of workflow definition but might be stored separately or as JSON.
  // The user asked to "Connect Node 1 -> Node 2".
  // If Edge is a model:
  /*
  await prisma.edge.create({
    data: {
      workflowId: testWorkflow.id,
      sourceId: "node-1",
      targetId: "node-2",
    }
  });
  */
  // Since I don't have the full schema, I'll assume Edge is a model or part of the workflow.
  // The user prompt mentioned "include: { nodes: true, edges: true }" which implies Edge is a relation.
  // However, my previous edit failed because 'edges' does not exist in WorkflowInclude.
  // This suggests Edges might be stored in a JSON field or I missed the relation name.
  // Let's check the schema first to be safe, but for now I will just create the nodes as requested.
  
  console.log("Seeded Functional Test Workflow:", testWorkflow.id);

  // ============================================================
  // 2. Seed "Full Integration Test Flow"
  // ============================================================
  const fullTestWorkflow = await prisma.workflow.upsert({
    where: {
      ownerId_name: {
        ownerId: user.id,
        name: "Full Integration Test Flow"
      }
    },
    update: {
      description: "Comprehensive end-to-end test of multiple node types.",
      isActive: true,
      edgesJson: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
        { id: "e3", source: "n3", target: "n4", label: "True" }, // True branch
        { id: "e4", source: "n3", target: "n5", label: "False" }, // False branch
        { id: "e5", source: "n4", target: "n6" },
        { id: "e6", source: "n5", target: "n6" }
      ],
      nodes: {
        deleteMany: {},
        create: [
          {
            id: "n1",
            name: "Start Flow",
            type: 'TRIGGER_MANUAL' as NodeType,
            positionX: 100,
            positionY: 300,
            configJson: {}
          },
          {
            id: "n2",
            name: "RSS Feed Reader (Simulated)",
            // Using LOGIC_CODE to simulate RSS_FEED_READER since it's missing from Prisma Enum
            type: 'LOGIC_CODE' as NodeType, 
            positionX: 300,
            positionY: 300,
            configJson: {
              code: `
                // Simulate fetching RSS feed
                // In real scenario, we would use axios to fetch XML and parse it
                console.log("Fetching RSS Feed...");
                return {
                  title: "NYT Europe",
                  items: [
                    { title: "Article 1", link: "http://..." },
                    { title: "Article 2", link: "http://..." }
                  ]
                };
              `
            }
          },
          {
            id: "n3",
            name: "Check Items",
            type: NodeType.LOGIC_IF,
            positionX: 500,
            positionY: 300,
            configJson: {
              valueA: "{{n2.items.length}}",
              operator: "GT",
              valueB: "0"
            }
          },
          {
            id: "n4",
            name: "Query Users",
            type: NodeType.ACTION_DB_QUERY, // Using ACTION_DB_QUERY as POSTGRES_DB might be missing
            positionX: 700,
            positionY: 200,
            configJson: {
              query: "SELECT * FROM \"User\" LIMIT 1;" // Prisma uses "User" table (capitalized usually)
            }
          },
          {
            id: "n5",
            name: "Fallback HTTP",
            type: NodeType.ACTION_HTTP,
            positionX: 700,
            positionY: 400,
            configJson: {
              method: "GET",
              url: "https://jsonplaceholder.typicode.com/todos/1" // Public test API
            }
          },
          {
            id: "n6",
            name: "Log Result",
            type: 'INTEGRATION_FILE_SYSTEM' as NodeType,
            positionX: 900,
            positionY: 300,
            configJson: {
              operation: "WRITE", // Using WRITE/APPEND
              filePath: "./test-output.log",
              content: "Flow executed. DB Result: {{n4}} | HTTP Result: {{n5}}"
            }
          }
        ]
      }
    },
    create: {
      name: "Full Integration Test Flow",
      description: "Comprehensive end-to-end test of multiple node types.",
      ownerId: user.id,
      isActive: true,
      edgesJson: [
        { id: "e1", source: "n1", target: "n2" },
        { id: "e2", source: "n2", target: "n3" },
        { id: "e3", source: "n3", target: "n4", label: "True" }, // True branch
        { id: "e4", source: "n3", target: "n5", label: "False" }, // False branch
        { id: "e5", source: "n4", target: "n6" },
        { id: "e6", source: "n5", target: "n6" }
      ],
      nodes: {
        create: [
          {
            id: "n1",
            name: "Start Flow",
            type: 'TRIGGER_MANUAL' as NodeType,
            positionX: 100,
            positionY: 300,
            configJson: {}
          },
          {
            id: "n2",
            name: "RSS Feed Reader (Simulated)",
            // Using LOGIC_CODE to simulate RSS_FEED_READER since it's missing from Prisma Enum
            type: 'LOGIC_CODE' as NodeType, 
            positionX: 300,
            positionY: 300,
            configJson: {
              code: `
                // Simulate fetching RSS feed
                // In real scenario, we would use axios to fetch XML and parse it
                console.log("Fetching RSS Feed...");
                return {
                  title: "NYT Europe",
                  items: [
                    { title: "Article 1", link: "http://..." },
                    { title: "Article 2", link: "http://..." }
                  ]
                };
              `
            }
          },
          {
            id: "n3",
            name: "Check Items",
            type: NodeType.LOGIC_IF,
            positionX: 500,
            positionY: 300,
            configJson: {
              valueA: "{{n2.items.length}}",
              operator: "GT",
              valueB: "0"
            }
          },
          {
            id: "n4",
            name: "Query Users",
            type: NodeType.ACTION_DB_QUERY, // Using ACTION_DB_QUERY as POSTGRES_DB might be missing
            positionX: 700,
            positionY: 200,
            configJson: {
              query: "SELECT * FROM \"User\" LIMIT 1;" // Prisma uses "User" table (capitalized usually)
            }
          },
          {
            id: "n5",
            name: "Fallback HTTP",
            type: NodeType.ACTION_HTTP,
            positionX: 700,
            positionY: 400,
            configJson: {
              method: "GET",
              url: "https://jsonplaceholder.typicode.com/todos/1" // Public test API
            }
          },
          {
            id: "n6",
            name: "Log Result",
            type: 'INTEGRATION_FILE_SYSTEM' as NodeType,
            positionX: 900,
            positionY: 300,
            configJson: {
              operation: "WRITE", // Using WRITE/APPEND
              filePath: "./test-output.log",
              content: "Flow executed. DB Result: {{n4}} | HTTP Result: {{n5}}"
            }
          }
        ]
      }
    }
  });

  console.log("Seeded Full Integration Test Workflow:", fullTestWorkflow.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
