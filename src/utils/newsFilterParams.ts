import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/zh-cn";

dayjs.locale("zh-cn");

export type DateRangeValue = readonly [Dayjs | null, Dayjs | null];

function parseDate(value: string | undefined): Dayjs | null {
  if (!value || !/^\d{8}$/.test(value)) return null;

  const date = dayjs(
    `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`,
  );
  return date.isValid() ? date : null;
}

export function parseDuringParam(
  value: string | null,
): [Dayjs | null, Dayjs | null] | null {
  if (!value) return null;

  const [startValue, endValue] = value.split("-", 2);
  const range: [Dayjs | null, Dayjs | null] = [
    parseDate(startValue),
    parseDate(endValue),
  ];

  return range[0] || range[1] ? range : null;
}

export function formatDuringParam(
  value: DateRangeValue | null | undefined,
): string | undefined {
  const [start, end] = value ?? [];
  if (!start && !end) return undefined;

  return `${start?.format("YYYYMMDD") ?? ""}-${end?.format("YYYYMMDD") ?? ""}`;
}
