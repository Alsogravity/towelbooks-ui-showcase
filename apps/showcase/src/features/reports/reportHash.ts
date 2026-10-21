import {
  reportTargetTypeSchema,
  type ReportTargetType,
} from '@towelbooks/schemas';
import { z } from 'zod';

export type ReportTarget = {
  targetId: string;
  targetType: ReportTargetType;
};

const REPORT_HASH_PREFIX = '#report';
const reportTargetIdSchema = z.string().uuid();

export function isReportTarget(value: ReportTarget): boolean {
  return (
    reportTargetTypeSchema.safeParse(value.targetType).success &&
    reportTargetIdSchema.safeParse(value.targetId).success
  );
}

export function buildReportHash(target: ReportTarget): string {
  if (!isReportTarget(target)) {
    throw new Error('Cannot build a report hash for an invalid target.');
  }

  return `${REPORT_HASH_PREFIX}/${target.targetType}/${target.targetId}`;
}

export function parseReportHash(hash: string): ReportTarget | null {
  if (!hash.startsWith(`${REPORT_HASH_PREFIX}/`)) {
    return null;
  }

  const segments = hash.slice(`${REPORT_HASH_PREFIX}/`.length).split('/');

  if (segments.length !== 2) {
    return null;
  }

  const [targetType, targetId] = segments;

  if (
    targetType === undefined ||
    targetId === undefined ||
    !isReportTarget({
      targetId,
      targetType: targetType as ReportTargetType,
    })
  ) {
    return null;
  }

  return {
    targetId,
    targetType: targetType as ReportTargetType,
  };
}
