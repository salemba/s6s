import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { INode, IExecutionResult, NodeType } from '../../../../../packages/shared/src/interfaces/s6s.interface';
import { resolveDynamicParameters } from '../../../../../packages/shared/src/utils/dynamic-resolver';

@Injectable()
export class ActionRunnerService {
  private readonly logger = new Logger(ActionRunnerService.name);

  constructor(private readonly httpService: HttpService) {}

  /**
   * Main entry point for executing action nodes.
   * Routes to specific handlers based on node type.
   */
  async executeAction(node: INode, credentials: any = {}, context?: IExecutionResult): Promise<object> {
    switch (node.type) {
      case 'LLM_QUERY':
        return this._executeLLMQuery(node.config, credentials, context);
      case 'EMAIL_SENDER':
        return this._executeEmailSender(node.config, credentials);
      case 'POSTGRES_DB':
        return this._executePostgresQuery(node.config?.query, credentials);
      case 'RSS_FEED_READER':
        return this._executeRssReader(node.config?.url);
      case 'CLOUD_STORAGE':
        return this._executeCloudStorage(node.config, credentials);
      case NodeType.INTEGRATION_TEAMS:
        return this._executeTeams(node.config);
      case NodeType.INTEGRATION_EXCEL:
        return this._executeExcel(node.config);
      case NodeType.INTEGRATION_FILE_SYSTEM:
        return this._executeFileSystem(node.config);
      case NodeType.TRIGGER_MANUAL:
        // Manual trigger is just a pass-through, no action needed
        return { status: 'success', message: 'Manual trigger executed' };
      case 'ACTION_HTTP':
      default:
        return this.executeHttpRequest(node, credentials);
    }
  }

  /**
   * Helper to execute Cloud Storage operations.
   * Supports AWS S3, Azure Blob, and Google Cloud Storage.
   */
  private async _executeCloudStorage(config: any, credentials: any): Promise<object> {
    this.logger.log(`Executing Cloud Storage Operation: ${config?.operation} on ${config?.provider}`);

    const { provider, operation, bucket, filePath } = config || {};

    if (!provider || !operation || !bucket || !filePath) {
      throw new Error('Cloud Storage requires provider, operation, bucket, and filePath.');
    }

    // Integration Note:
    // Install the following SDKs as needed:
    // npm install @aws-sdk/client-s3 @azure/storage-blob @google-cloud/storage

    /*
    // AWS S3 Example
    if (provider === 'AWS') {
      // import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
      // const client = new S3Client({
      //   region: 'us-east-1',
      //   credentials: {
      //     accessKeyId: credentials.accessKeyId,
      //     secretAccessKey: credentials.secretAccessKey
      //   }
      // });

      // if (operation === 'UPLOAD') {
      //   await client.send(new PutObjectCommand({ Bucket: bucket, Key: filePath, Body: '...' }));
      // }
    }
    */

    /*
    // Azure Blob Example
    if (provider === 'AZURE') {
      // import { BlobServiceClient } from "@azure/storage-blob";
      // const blobServiceClient = BlobServiceClient.fromConnectionString(credentials.connectionString);
      // const containerClient = blobServiceClient.getContainerClient(bucket);
      // const blockBlobClient = containerClient.getBlockBlobClient(filePath);
      
      // if (operation === 'UPLOAD') {
      //   await blockBlobClient.upload('...', 3);
      // }
    }
    */

    /*
    // Google Cloud Storage Example
    if (provider === 'GCP') {
      // import { Storage } from "@google-cloud/storage";
      // const storage = new Storage({ credentials: JSON.parse(credentials.serviceAccountKey) });
      // const bucketObj = storage.bucket(bucket);
      // const file = bucketObj.file(filePath);

      // if (operation === 'UPLOAD') {
      //   await file.save('...');
      // }
    }
    */

    // Mock Execution
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'SUCCESS',
          provider,
          operation,
          bucket,
          filePath,
          message: `Successfully performed ${operation} on ${filePath} in ${bucket} (${provider})`,
          data: operation === 'LIST' ? ['file1.txt', 'file2.jpg'] : { size: 1024, etag: 'mock-etag' }
        });
      }, 500);
    });
  }

  /**
   * Helper to execute a PostgreSQL query.
   * Uses 'pg' library (mocked for now) to connect and query.
   */
  private async _executePostgresQuery(query: string, credentials: any): Promise<object> {
    if (!query) {
      throw new Error('SQL Query is required');
    }

    this.logger.log(`Executing Postgres Query: ${query}`);

    // Integration Note:
    // In a real implementation, we would install and use 'pg':
    // npm install pg @types/pg
    // import { Client } from 'pg';
    
    // const client = new Client({
    //   user: credentials.username,
    //   host: credentials.host,
    //   database: credentials.database,
    //   password: credentials.password,
    //   port: credentials.port || 5432,
    // });
    
    // await client.connect();
    // const res = await client.query(query);
    // await client.end();
    // return { rowCount: res.rowCount, rows: res.rows };

    // Mock Execution
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'SUCCESS',
          rowCount: 2,
          rows: [
            { id: 1, name: 'Mock Row 1', value: 100 },
            { id: 2, name: 'Mock Row 2', value: 200 }
          ],
          message: 'Query executed successfully (Simulated)'
        });
      }, 200);
    });
  }

  /**
   * Helper to fetch and parse an RSS feed.
   * Uses 'rss-parser' (mocked for now) to retrieve feed items.
   */
  private async _executeRssReader(url: string): Promise<object> {
    if (!url) {
      throw new Error('RSS Feed URL is required');
    }

    this.logger.log(`Fetching RSS Feed: ${url}`);

    // Integration Note:
    // In a real implementation, we would install and use 'rss-parser':
    // npm install rss-parser
    // import Parser from 'rss-parser';
    // const parser = new Parser();
    // const feed = await parser.parseURL(url);
    
    // For now, we simulate fetching the feed using HttpService and returning a mock structure.
    try {
      // Verify URL is reachable
      await firstValueFrom(this.httpService.get(url));

      // Return mock parsed data
      return {
        title: 'Mock RSS Feed',
        description: 'This is a simulated RSS feed response',
        items: [
          {
            title: 'Latest News 1',
            link: `${url}/item1`,
            pubDate: new Date().toISOString(),
            content: 'Content for item 1'
          },
          {
            title: 'Latest News 2',
            link: `${url}/item2`,
            pubDate: new Date().toISOString(),
            content: 'Content for item 2'
          }
        ]
      };
    } catch (error: any) {
      this.logger.error(`Failed to fetch RSS feed: ${error.message}`);
      throw new Error(`RSS Fetch Error: ${error.message}`);
    }
  }

  /**
   * Executes an HTTP request based on the node configuration.
   * 
   * @param node The node definition containing the request configuration.
   * @param credentials Optional credentials to inject into the request.
   * @returns The response data from the HTTP request.
   */
  async executeHttpRequest(node: INode, credentials: any = {}): Promise<object> {
    this.logger.log(`Executing HTTP Request for node: ${node.name}`);

    const { method, url, headers, body } = node.config || {};

    if (!url) {
      const errorMsg = `Node ${node.name} is missing a URL configuration.`;
      this.logger.error(errorMsg);
      return {
        statusCode: 400,
        error: 'Bad Request',
        message: errorMsg,
      };
    }

    // Merge configured headers with credential headers if any
    const requestHeaders = {
      'Content-Type': 'application/json', // Default
      ...(headers || {}),
    };

    // Securely inject credentials
    if (credentials) {
      if (credentials.token) {
        requestHeaders['Authorization'] = `Bearer ${credentials.token}`;
      }
      if (credentials.apiKey) {
        // Assuming 'X-API-Key' as a common standard, or it could be configured
        requestHeaders['X-API-Key'] = credentials.apiKey;
      }
      if (credentials.username && credentials.password) {
        const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64');
        requestHeaders['Authorization'] = `Basic ${auth}`;
      }
    }

    try {
      const response$ = this.httpService.request({
        method: method || 'GET',
        url: url,
        headers: requestHeaders,
        data: body,
        validateStatus: () => true, // Do not throw on 4xx/5xx, handle them as valid responses
      });

      const response = await firstValueFrom(response$);
      
      this.logger.log(`HTTP Request completed: ${response.status} ${response.statusText}`);

      return {
        statusCode: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      };

    } catch (error: any) {
      this.logger.error(`HTTP Request failed for node ${node.name}: ${error.message}`);
      
      // Handle Network Errors (no response received)
      return {
        statusCode: error.response?.status || 500,
        error: error.code || 'INTERNAL_SERVER_ERROR',
        message: error.message,
        data: error.response?.data || null,
      };
    }
  }

  /**
   * Helper to send an email using Nodemailer.
   * Requires SMTP credentials and email configuration.
   */
  private async _executeEmailSender(config: any, credentials: any): Promise<object> {
    this.logger.log(`Executing Email Sender to: ${config?.to}`);

    if (!config?.to || !config?.subject || !config?.body) {
      throw new Error('Email configuration (To, Subject, Body) is incomplete.');
    }

    // Integration Note:
    // We use 'nodemailer' to send emails via SMTP.
    // Ensure 'nodemailer' is installed: npm install nodemailer @types/nodemailer

    // 1. Create Transporter
    // We expect credentials to contain: host, port, user, pass, secure (optional)
    const transporter = nodemailer.createTransport({
      host: credentials.host || 'smtp.example.com',
      port: Number(credentials.port) || 587,
      secure: credentials.secure === true || credentials.secure === 'true', // true for 465, false for other ports
      auth: {
        user: credentials.user || credentials.username,
        pass: credentials.pass || credentials.password,
      },
    });

    try {
      // 2. Verify connection configuration
      await transporter.verify();

      // 3. Send Email
      const info = await transporter.sendMail({
        from: credentials.from || credentials.user || '"S6S Automation" <no-reply@s6s.com>', // sender address
        to: config.to, // list of receivers
        subject: config.subject, // Subject line
        text: config.body, // plain text body
        html: config.htmlBody || `<div>${config.body}</div>`, // html body
      });

      this.logger.log(`Email sent: ${info.messageId}`);

      return {
        status: 'SUCCESS',
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info),
        accepted: info.accepted,
        rejected: info.rejected,
      };
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      return {
        status: 'FAILED',
        error: error.message,
        code: error.code,
        command: error.command,
      };
    }
  }

  /**
   * Helper to execute an LLM Query.
   * Integrates with AI providers (e.g., OpenAI, Google Gemini).
   */
  private async _executeLLMQuery(config: any, credentials: any, context?: IExecutionResult): Promise<object> {
    this.logger.log(`Executing LLM Query with model: ${config?.model}`);

    const promptTemplate = config?.prompt;
    if (!promptTemplate) {
      throw new Error('LLM Query requires a prompt.');
    }

    // 1. Resolve Dynamic Parameters in the Prompt
    // This allows the prompt to include data from previous nodes (e.g., "Summarize this: {{ $node['RSS'].items[0].content }}")
    let resolvedPrompt = promptTemplate;
    if (context) {
      const resolved = resolveDynamicParameters(promptTemplate, context);
      // Ensure the result is a string for the LLM
      resolvedPrompt = typeof resolved === 'string' ? resolved : JSON.stringify(resolved);
    }

    this.logger.log(`Resolved Prompt: ${resolvedPrompt.substring(0, 50)}...`);

    // Integration Note:
    // In a real implementation, we would use the 'openai' or '@google/genai' SDKs.
    // npm install openai
    // import { OpenAI } from 'openai';

    // const openai = new OpenAI({ 
    //   apiKey: credentials.apiKey,
    //   baseURL: config.endpoint // Optional custom endpoint
    // });
    // const response = await openai.chat.completions.create({
    //   model: config.model || 'gpt-4o',
    //   messages: [{ role: 'user', content: resolvedPrompt }],
    //   temperature: Number(config.temperature) || 0.7,
    // });
    // return { content: response.choices[0].message.content };

    // Mock Execution
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          status: 'SUCCESS',
          model: config?.model || 'mock-model',
          endpoint: config?.endpoint || 'default',
          prompt: resolvedPrompt,
          response: `[Mock LLM Response] I have processed your request: "${resolvedPrompt.substring(0, 20)}..."`,
          usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
        });
      }, 500);
    });
  }

  /**
   * Helper to execute Microsoft Teams operations via Webhook.
   */
  private async _executeTeams(config: any): Promise<object> {
    this.logger.log(`Executing Teams Operation`);
    const { webhookUrl, message } = config || {};

    if (!webhookUrl) {
      throw new Error('Teams Node requires a webhookUrl.');
    }

    const payload = {
      text: message || 'Notification from S6S Workflow',
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(webhookUrl, payload)
      );
      return { status: 'success', data: response.data };
    } catch (error: any) {
      this.logger.error(`Teams execution failed: ${error.message}`);
      throw new Error(`Teams execution failed: ${error.message}`);
    }
  }

  /**
   * Helper to execute Excel operations.
   */
  private async _executeExcel(config: any): Promise<object> {
    this.logger.log(`Executing Excel Operation: ${config?.operation}`);
    const { operation, filePath, data, sheetName } = config || {};

    if (!operation || !filePath) {
      throw new Error('Excel Node requires operation and filePath.');
    }

    if (operation === 'READ') {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[sheetName || workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      return { status: 'success', data: jsonData };
    }

    if (operation === 'WRITE') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(Array.isArray(data) ? data : [data]);
      XLSX.utils.book_append_sheet(wb, ws, sheetName || 'Sheet1');
      XLSX.writeFile(wb, filePath);
      return { status: 'success', message: `File written to ${filePath}` };
    }

    throw new Error(`Unsupported Excel operation: ${operation}`);
  }

  /**
   * Helper to execute File System operations.
   */
  private async _executeFileSystem(config: any): Promise<object> {
    this.logger.log(`Executing File System Operation: ${config?.operation}`);
    const { operation, filePath, content, encoding } = config || {};

    if (!operation || !filePath) {
      throw new Error('File System Node requires operation and filePath.');
    }

    switch (operation) {
      case 'READ':
        if (!fs.existsSync(filePath)) {
          throw new Error(`File not found: ${filePath}`);
        }
        const fileContent = fs.readFileSync(filePath, { encoding: encoding || 'utf-8' });
        return { status: 'success', content: fileContent };
      
      case 'WRITE':
        fs.writeFileSync(filePath, content || '', { encoding: encoding || 'utf-8' });
        return { status: 'success', message: `File written to ${filePath}` };
      
      case 'DELETE':
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          return { status: 'success', message: `File deleted: ${filePath}` };
        }
        return { status: 'warning', message: `File not found: ${filePath}` };
        
      case 'LIST':
        if (!fs.existsSync(filePath)) {
           throw new Error(`Directory not found: ${filePath}`);
        }
        const files = fs.readdirSync(filePath);
        return { status: 'success', files };

      default:
        throw new Error(`Unsupported File System operation: ${operation}`);
    }
  }
}
