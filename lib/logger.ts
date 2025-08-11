/**
 * Centralized logging utility for the application
 * Provides structured logging with different levels and environments
 */

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: LogContext;
  timestamp: string;
  stack?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  private formatMessage(entry: LogEntry): string {
    const { level, message, context, timestamp } = entry;
    
    if (this.isDevelopment) {
      // Development: colorful console output
      const colors = {
        [LogLevel.ERROR]: '\x1b[31m', // Red
        [LogLevel.WARN]: '\x1b[33m',  // Yellow
        [LogLevel.INFO]: '\x1b[36m',  // Cyan
        [LogLevel.DEBUG]: '\x1b[37m'  // White
      };
      const reset = '\x1b[0m';
      const color = colors[level];
      
      let formatted = `${color}[${level.toUpperCase()}]${reset} ${message}`;
      if (context && Object.keys(context).length > 0) {
        formatted += `\n  Context: ${JSON.stringify(context, null, 2)}`;
      }
      return formatted;
    } else {
      // Production: structured JSON
      return JSON.stringify(entry);
    }
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error) {
    // Skip logs in test environment unless explicitly enabled
    if (this.isTest && !process.env.ENABLE_LOGGING) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      ...(error && { stack: error.stack })
    };

    const formatted = this.formatMessage(entry);

    // Console output based on level
    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formatted);
        }
        break;
    }

    // In production, you might want to send logs to external service
    if (!this.isDevelopment && !this.isTest) {
      // TODO: Send to logging service (DataDog, LogRocket, etc.)
      // this.sendToLoggingService(entry);
    }
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log(LogLevel.ERROR, message, context, error);
  }

  warn(message: string, context?: LogContext) {
    this.log(LogLevel.WARN, message, context);
  }

  info(message: string, context?: LogContext) {
    this.log(LogLevel.INFO, message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log(LogLevel.DEBUG, message, context);
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, context?: LogContext) {
    this.info(`API ${method} ${url}`, context);
  }

  apiError(method: string, url: string, error: Error, context?: LogContext) {
    this.error(`API ${method} ${url} failed`, error, context);
  }

  // Database-specific logging
  dbQuery(query: string, duration?: number) {
    this.debug(`DB Query: ${query}${duration ? ` (${duration}ms)` : ''}`);
  }

  dbError(operation: string, error: Error, context?: LogContext) {
    this.error(`Database ${operation} failed`, error, context);
  }

  // Authentication logging
  authSuccess(userId: string, action: string) {
    this.info(`Auth success: ${action}`, { userId, action });
  }

  authFailure(action: string, reason: string, context?: LogContext) {
    this.warn(`Auth failure: ${action}`, { reason, ...context });
  }

  // Business logic logging
  businessEvent(event: string, context?: LogContext) {
    this.info(`Business event: ${event}`, context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions for common patterns
export const logApiError = (operation: string, error: any, context?: LogContext) => {
  logger.error(`${operation} failed`, error instanceof Error ? error : new Error(String(error)), context);
};

export const logApiSuccess = (operation: string, context?: LogContext) => {
  logger.info(`${operation} completed successfully`, context);
};