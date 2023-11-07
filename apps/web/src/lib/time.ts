import dayjs from 'dayjs'

export const echoTime = (current: string): string => {
  return dayjs(current).format('D MMM, YYYY')
}

export const getYearByTimestamp = (timestamp: string): string => {
  return dayjs(timestamp).format('YYYY')
}

export const getMonthAndDayByTimestamp = (timestamp: string): string => {
  return dayjs(timestamp).format('DD MMM')
}
