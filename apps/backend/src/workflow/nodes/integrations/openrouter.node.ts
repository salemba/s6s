import { Injectable } from '@nestjs/common';
import { VaultService } from '../../../vault/vault.service';
import { PrismaService } from '../../../prisma/prisma.service';
import { resolveDynamicParameters } from '../../../../../../packages/shared/src/utils/dynamic-resolver';
import { INode, IExecutionResult } from '../../../../../../packages/shared/src/interfaces/s6s.interface';
//import OpenAI from 'openai';
import { OpenRouter } from '@openrouter/sdk';

@Injectable()
export class OpenRouterNode {
  constructor(
    private readonly vaultService: VaultService,
    private readonly prisma: PrismaService
  ) {}

  async execute(node: INode, executionContext: IExecutionResult): Promise<any> {
    // ...existing code...
  }
  
  async run(node: INode, credentials: Record<string, string>, executionContext: IExecutionResult): Promise<any> {
    const config = node.config as any || {};
    
    // 2. Resolve Parameters
    const modelName = String(resolveDynamicParameters(config.modelName || 'openai/gpt-3.5-turbo', executionContext));
    const prompt = String(resolveDynamicParameters(config.prompt || '', executionContext));

    // 3. Get API Key
    let apiKey = Object.values(credentials)[0];

    // Fallback: If no credential injected, try to fetch by ID from config
    if (!apiKey && config.credentialId) {
        try {
            const credential = await this.prisma.credential.findUnique({
                where: { id: config.credentialId }
            });

            if (credential && credential.cipherText) {
                // Reconstruct the encrypted string format expected by VaultService: IV|AuthTag|CipherText
                // Prisma stores them as Bytes, so we convert to Base64
                const iv = credential.iv.toString('base64');
                const authTag = credential.authTag.toString('base64');
                const cipherText = credential.cipherText.toString('base64');
                
                const encryptedString = `${iv}|${authTag}|${cipherText}`;
                apiKey = await this.vaultService.decryptSecret(encryptedString);
            }
        } catch (err) {
            console.error('Failed to fetch/decrypt credential in OpenRouterNode:', err);
        }
    }

    if (!apiKey) {
      throw new Error('No OpenRouter API Key credential linked to this node.');
    }
    // 4. Call OpenRouter
    const openRouter = new OpenRouter({
      apiKey: apiKey
    });
    const result = await openRouter.chat.send({
        messages: [
            {
            role: "user",
            content: prompt,
            },
        ],
        model: modelName,
        // provider: {
        //     zdr: true,
        //     sort: "price",
        // },
        stream: false
        });

    return result.choices[0].message.content;
  }
}
