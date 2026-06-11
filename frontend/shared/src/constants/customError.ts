import { getKey } from '../types/I18nKeyType';
import type { TranslatorFn } from './commonConst';

export enum ErrorId {
  AUTH_00001 = 'AUTH_00001',
  AUTH_00002 = 'AUTH_00002',
  AUTH_00003 = 'AUTH_00003',
  AUTH_00004 = 'AUTH_00004',
  QUIZ_00001 = 'QUIZ_00001',
}

export const ErrorCode = (t: TranslatorFn) => ({
  [ErrorId.AUTH_00001]: t(getKey('auth_00001_error')),
  [ErrorId.AUTH_00002]: t(getKey('auth_00002_error')),
  [ErrorId.AUTH_00003]: t(getKey('auth_00003_error')),
  [ErrorId.AUTH_00004]: t(getKey('auth_00004_error')),
  [ErrorId.QUIZ_00001]: t(getKey('quiz_retry_limit_exceeded')),
});
