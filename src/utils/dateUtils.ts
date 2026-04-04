import dayjs, { type Dayjs } from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

/** API tarih formatları */
export const DATE_API_FMT     = 'YYYYMMDD';       // sadece tarih: 20240115
export const DATETIME_API_FMT = 'YYYYMMDDHHmmss'; // tarih+saat:   20240115143022

/** Görüntüleme formatları */
export const DATE_DISPLAY_FMT     = 'DD.MM.YYYY';       // 15.01.2024
export const DATETIME_DISPLAY_FMT = 'DD.MM.YYYY HH:mm'; // 15.01.2024 14:30

/** API'den gelen "yyyyMMdd" → "DD.MM.YYYY" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const d = dayjs(value, DATE_API_FMT, true);
  return d.isValid() ? d.format(DATE_DISPLAY_FMT) : value;
}

/** API'den gelen "yyyyMMddHHmmss" → "DD.MM.YYYY HH:mm" */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const d = dayjs(value, DATETIME_API_FMT, true);
  return d.isValid() ? d.format(DATETIME_DISPLAY_FMT) : value;
}

/** DatePicker Dayjs → API string "yyyyMMdd" */
export function toApiDate(value: Dayjs | null | undefined): string | null {
  if (!value || !dayjs.isDayjs(value)) return null;
  return value.format(DATE_API_FMT);
}

/** DateTimePicker Dayjs → API string "yyyyMMddHHmmss" */
export function toApiDateTime(value: Dayjs | null | undefined): string | null {
  if (!value || !dayjs.isDayjs(value)) return null;
  return value.format(DATETIME_API_FMT);
}

/** API "yyyyMMdd" → DatePicker için Dayjs */
export function fromApiDate(value: string | null | undefined): Dayjs | null {
  if (!value) return null;
  const d = dayjs(value, DATE_API_FMT, true);
  return d.isValid() ? d : null;
}

/** API "yyyyMMddHHmmss" → DateTimePicker için Dayjs */
export function fromApiDateTime(value: string | null | undefined): Dayjs | null {
  if (!value) return null;
  const d = dayjs(value, DATETIME_API_FMT, true);
  return d.isValid() ? d : null;
}
