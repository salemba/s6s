# 🏛️ S6S Workflow Automation Platform: Architecture Specification

**Role:** Principal Software Architect and Senior Full-Stack Engineer.

**Project Name:** S6S (Enterprise Workflow Automation)

**Goal:** Design the foundational architecture, schemas, and core interfaces for a low-code workflow automation platform with a heavy emphasis on security and enterprise features.

## 1. System References & Guiding Principles

* **Visual Editor/Execution:** Heavily inspired by **n8n** (visual canvas, node-based data flow).
* **Security/Policy:** Inspired by **Google Opal** (strict identity governance, policy-driven access, and robust audit trails).
* **Principle:** Security-first design. Credentials and secrets must be isolated and encrypted at rest.

## 2. Technical Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | React, TypeScript | Main application interface. |
| **Canvas** | React Flow | Library for the node-based visual editor. |
| **Styling** | TailwindCSS, ShadcnUI | Modern, utility-first styling. |
| **Backend** | NestJS (Node.js) | Scalable, modular, TypeScript-native framework. |
| **Database** | PostgreSQL | Reliability and transactional integrity for workflow metadata. |
| **Queue/Cache** | Redis (BullMQ) | High-performance job queuing and execution state management. |
| **Execution** | TypeScript/Isolated VM (vm2) | Sandboxed execution environment for custom code nodes. |

## 3. Core Feature Specifications

### 3.1. The Workflow Engine & Nodes

| Feature | Specification |
| :--- | :--- |
| **Nodes Interface** | A generic `INode` interface defining input schema, output schema, and configuration fields. |
| **Node Types** | **Triggers** (Webhook, Cron, Polling), **Actions** (HTTP Request, DB Query, Slack, AWS), **Logic** (If/Else, Merge, Wait). |
| **Dynamic Linking** | Node configuration supports template syntax for referencing previous node output: `{{ $node["StepName"].json.outputKey }}`. This must be parsed and resolved at runtime. |
| **Graph Traversal**| Executes as a Directed Acyclic Graph (DAG). Supports branching and merging. |

### 3.2. Security, Identity & Governance (Opal Layer)

| Feature | Specification |
| :--- | :--- |
| **Authentication** | Support for **SSO** via SAML 2.0 and OIDC (Passport.js implementation). |
| **LDAP/SCIM** | Connector service for syncing user identity and **Group** membership from external providers (e.g., LDAP, Active Directory) to s6s Roles. |
| **Role-Based Access Control (RBAC)** | Permissions (Viewer, Editor, Admin, Auditor) must be applied to specific **Projects** and **Workflows**. |
| **Audit Log** | Immutable log of all workflow changes, execution results, and user actions (e.g., credential access, policy updates). |

### 3.3. The Vault (Credential Management)

| Feature | Specification |
| :--- | :--- |
| **Storage Mechanism** | Dedicated `Credentials` service. Secrets are stored in the PostgreSQL DB but **must** be encrypted. |
| **Encryption** | Use **AES-256-GCM** with a rotating master key (stored in an external environment variable/key vault). |
| **Scoping** | Credentials can be scoped to: **Global** (any workflow), **Project** (workflows in one project), or **User** (private credentials). |
| **Injection** | Secrets are decrypted only **in memory** by the Execution Worker just before a node runs, and immediately cleared afterward. |

### 3.4. Execution Environment

| Feature | Specification |
| :--- | :--- |
| **Architecture** | Asynchronous Producer/Consumer model. Front-end triggers an execution (Producer), which queues the job to Redis (Queue), and Worker services (Consumers) process the job. |
| **Sandboxing** | Custom Code nodes (e.g., JavaScript) must be run inside a secure, non-blocking sandboxed process (e.g., `vm2` library or isolated child process) to prevent Remote Code Execution (RCE) on the main host. |

## 4. Initial Deliverables

Based on the specifications above, the first steps for Copilot are to generate:

1.  **Project Structure:** Monorepo folder structure (`apps/frontend`, `apps/backend`, `packages/shared`).
2.  **Database Schema:** Full `schema.prisma` file including models for `User`, `Role`, `Workflow`, `Node`, `Execution`, and the encrypted `Credential` model.
3.  **Core Interfaces:** TypeScript interfaces for `INode`, `IWorkflowDefinition`, and the `IExecutionResult`.
4.  **Vault Service Skeleton:** A `VaultService.ts` class with placeholder methods for `encryptSecret(plainText: string)` and `decryptSecret(encryptedText: string)`.