import { ServerOptions } from './types/ServerOptions';

// Helper que acessa process.env de uma forma que evita que o bundler/babel avalie em build-time
const env = (key: string): string | undefined => {
  const p = (global as any).process || (typeof process !== 'undefined' ? (process as any) : undefined);
  return p && p.env ? p.env[key] : undefined;
};

const numericEnv = (key: string, fallback: number): number => {
  const value = env(key);
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const puppeteerExecutablePath =
  env('PUPPETEER_EXECUTABLE_PATH') && env('PUPPETEER_EXECUTABLE_PATH')!.trim().length > 0
    ? env('PUPPETEER_EXECUTABLE_PATH')
    : undefined;

export default {
  secretKey: env('SECRET_KEY') || 'THISISMYSECURETOKEN',
  host: env('HOST') || 'http://localhost',
  port: env('PORT') || '21465',
  deviceName: env('DEVICE_NAME') || 'WppConnect',
  poweredBy: 'WPPConnect-Server',
  startAllSession: env('START_ALL_SESSIONS') === 'true' || false,
  tokenStoreType: 'file',
  maxListeners: parseInt(env('MAX_LISTENERS') || '15'),
  customUserDataDir: env('CUSTOM_USER_DATA_DIR') || './userDataDir/',
  webhook: {
    url: env('WEBHOOK_URL') || null,
    autoDownload: env('WEBHOOK_AUTO_DOWNLOAD') !== 'false',
    uploadS3: env('WEBHOOK_UPLOAD_S3') === 'true',
    readMessage: env('WEBHOOK_READ_MESSAGE') !== 'false',
    allUnreadOnStart: env('WEBHOOK_ALL_UNREAD_ON_START') === 'true',
    listenAcks: env('WEBHOOK_LISTEN_ACKS') !== 'false',
    onPresenceChanged: env('WEBHOOK_ON_PRESENCE_CHANGED') !== 'false',
    onParticipantsChanged: env('WEBHOOK_ON_PARTICIPANTS_CHANGED') !== 'false',
    onReactionMessage: env('WEBHOOK_ON_REACTION_MESSAGE') !== 'false',
    onPollResponse: env('WEBHOOK_ON_POLL_RESPONSE') !== 'false',
    onRevokedMessage: env('WEBHOOK_ON_REVOKED_MESSAGE') !== 'false',
    onLabelUpdated: env('WEBHOOK_ON_LABEL_UPDATED') !== 'false',
    onSelfMessage: env('WEBHOOK_ON_SELF_MESSAGE') === 'true',
    ignore: ['status@broadcast'],
  },
  websocket: {
    autoDownload: env('WEBSOCKET_AUTO_DOWNLOAD') === 'true',
    uploadS3: env('WEBSOCKET_UPLOAD_S3') === 'true',
  },
  chatwoot: {
    sendQrCode: env('CHATWOOT_SEND_QR_CODE') !== 'false',
    sendStatus: env('CHATWOOT_SEND_STATUS') !== 'false',
  },
  archive: {
    enable: env('ARCHIVE_ENABLE') === 'true',
    waitTime: parseInt(env('ARCHIVE_WAIT_TIME') || '10'),
    daysToArchive: parseInt(env('ARCHIVE_DAYS_TO_ARCHIVE') || '45'),
  },
  log: {
    level: env('LOG_LEVEL') || 'silly',
    logger: (env('LOG_LOGGER') || 'console,file').split(','),
  },
  createOptions: {
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-sync',
      '--disable-translate',
      '--disable-background-networking',
      '--hide-scrollbars',
      '--mute-audio',
      '--no-first-run',
      '--no-default-browser-check',
      '--ignore-certificate-errors',
      '--ignore-ssl-errors'
    ],
    linkPreviewApiServers: null,
    autoClose: numericEnv('AUTO_CLOSE', 0),
    deviceSyncTimeout: numericEnv('DEVICE_SYNC_TIMEOUT', 0),
    puppeteerOptions: {
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-zygote'
      ],
      executablePath: puppeteerExecutablePath
    },
  },
  mapper: {
    enable: env('MAPPER_ENABLE') === 'true',
    prefix: env('MAPPER_PREFIX') || 'tagone-',
  },
  db: {
    mongodbDatabase: env('MONGODB_DATABASE') || 'tokens',
    mongodbCollection: env('MONGODB_COLLECTION') || '',
    mongodbUser: env('MONGODB_USER') || '',
    mongodbPassword: env('MONGODB_PASSWORD') || '',
    mongodbHost: env('MONGODB_HOST') || '',
    mongoIsRemote: env('MONGODB_IS_REMOTE') === 'true',
    mongoURLRemote: env('MONGODB_URL_REMOTE') || '',
    mongodbPort: parseInt(env('MONGODB_PORT') || '27017'),
    redisHost: env('REDIS_HOST') || 'localhost',
    redisPort: parseInt(env('REDIS_PORT') || '6379'),
    redisPassword: env('REDIS_PASSWORD') || '',
    redisDb: parseInt(env('REDIS_DB') || '0'),
    redisPrefix: env('REDIS_PREFIX') || 'docker',
  },
  aws_s3: {
    region: (env('AWS_S3_REGION') || 'sa-east-1') as any,
    access_key_id: env('AWS_S3_ACCESS_KEY_ID') || null,
    secret_key: env('AWS_S3_SECRET_KEY') || null,
    defaultBucketName: env('AWS_S3_DEFAULT_BUCKET_NAME') || null,
    endpoint: env('AWS_S3_ENDPOINT') || null,
    forcePathStyle: env('AWS_S3_FORCE_PATH_STYLE') === 'true' || null,
  },
} as unknown as ServerOptions;