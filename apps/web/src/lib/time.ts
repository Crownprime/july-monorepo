import dayjs from 'dayjs'

export const echoTime = (current: string) => {
  return dayjs(current).format('D MMM, YYYY')
}

export const getYearByTimestamp = (timestamp: string) => {
  return dayjs(timestamp).format('YYYY')
}

export const getMonthAndDayByTimestamp = (timestamp: string) => {
  return dayjs(timestamp).format('DD MMM')
}
