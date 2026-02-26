import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

type WebVitalsPayload = {
  id?: string;
  name?: string;
  value?: number;
  delta?: number;
  rating?: string;
  navigationType?: string;
};

function isValidPayload(payload: WebVitalsPayload): payload is Required<WebVitalsPayload> {
  return (
    typeof payload.id === 'string' &&
    payload.id.length > 0 &&
    typeof payload.name === 'string' &&
    payload.name.length > 0 &&
    typeof payload.value === 'number' &&
    Number.isFinite(payload.value) &&
    typeof payload.delta === 'number' &&
    Number.isFinite(payload.delta) &&
    typeof payload.rating === 'string' &&
    payload.rating.length > 0 &&
    typeof payload.navigationType === 'string' &&
    payload.navigationType.length > 0
  );
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as WebVitalsPayload;
    if (!isValidPayload(payload)) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Invalid web-vitals payload',
        },
        { status: 400 }
      );
    }

    logger.info('Web-vitals metric received', {
      metricName: payload.name,
      metricValue: payload.value,
      metricDelta: payload.delta,
      metricRating: payload.rating,
      navigationType: payload.navigationType,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    logger.error('Failed to process web-vitals payload', error);
    return NextResponse.json(
      {
        ok: false,
        message: 'Unable to process web-vitals payload',
      },
      { status: 500 }
    );
  }
}
