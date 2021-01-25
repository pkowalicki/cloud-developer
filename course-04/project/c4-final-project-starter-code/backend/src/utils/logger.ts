import * as winston from 'winston'
import { format } from 'winston'

/**
 * Create a logger instance to write log messages in JSON format.
 *
 * @param loggerName - a name of a logger that will be added to all messages
 */
export function createLogger(loggerName: string) {
  return winston.createLogger({
    level: 'info',
    format: format.combine(
      format.label({ label: loggerName }),
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })),
    transports: [
      new winston.transports.Console({
        format: format.combine(
          format.json(),
        )
      })
    ],
    exitOnError: false
  })
}