import { Injectable, Scope } from '@nestjs/common';

// TODO: Install pino
// npm install pino pino-pretty
// import pino from 'pino';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
  private context?: string;
  // private pinoLogger = pino({
  //   transport: {
  //     target: 'pino-pretty',
  //     options: { colorize: true },
  //   },
  // });

  setContext(context: string) {
    this.context = context;
  }

  log(message: string, context?: object) {
    const timestamp = new Date().toISOString();
    const ctx = this.context ? `[${this.context}]` : '';
    // this.pinoLogger.info({ ...context, context: this.context }, message);
    console.log(`[INFO] ${timestamp} ${ctx} ${message}`, context ? JSON.stringify(context) : '');
  }

  warn(message: string, context?: object) {
    const timestamp = new Date().toISOString();
    const ctx = this.context ? `[${this.context}]` : '';
    // this.pinoLogger.warn({ ...context, context: this.context }, message);
    console.warn(`[WARN] ${timestamp} ${ctx} ${message}`, context ? JSON.stringify(context) : '');
  }

  error(message: string, trace?: string, context?: object) {
    const timestamp = new Date().toISOString();
    const ctx = this.context ? `[${this.context}]` : '';
    // this.pinoLogger.error({ ...context, err: trace, context: this.context }, message);
    console.error(`[ERROR] ${timestamp} ${ctx} ${message}`, context ? JSON.stringify(context) : '');
    if (trace) {
      console.error(trace);
    }
  }
}
