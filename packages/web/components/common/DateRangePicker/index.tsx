import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Box, Card, Flex, useTheme, useOutsideClick, Button, Text, Input } from '@chakra-ui/react';
import { addDays, addHours, addMinutes, format } from 'date-fns';
import { type DateRange, DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import zhCN from 'date-fns/locale/zh-CN';
import { useTranslation } from 'next-i18next';
import MyIcon from '../Icon';

const DateRangePicker = ({
  onChange,
  onSuccess,
  onRestore,
  position = 'bottom',
  defaultDate = {
    from: addDays(new Date(), -30),
    to: new Date()
  },
  dateRange
}: {
  onChange?: (date: DateRange) => void;
  onSuccess?: (date: DateRange) => void;
  onRestore?: () => void;
  position?: 'bottom' | 'top';
  defaultDate?: DateRange;
  dateRange?: DateRange;
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const OutRangeRef = useRef(null);

  const timeOptions = [
    '最近 5 分钟',
    '最近 15 分钟',
    '最近 30 分钟',
    '最近 1 小时',
    '最近 3 小时',
    '最近 6 小时',
    '最近 24 小时',
    '最近 2 天',
    '最近 3 天',
    '最近 7 天'
  ];

  const [selectedTimeOption, setSelectedTimeOption] = useState<string>(() => {
    // 如果外部传入了dateRange，则不设置默认的时间快捷选项
    return dateRange ? '' : '最近 30 分钟';
  });

  const [range, setRange] = useState<DateRange | undefined>(dateRange || defaultDate);
  const [showSelected, setShowSelected] = useState(false);
  const [selectedFromDate, setSelectedFromDate] = useState<Date | undefined>(
    (dateRange || defaultDate).from
  );
  const [selectedToDate, setSelectedToDate] = useState<Date | undefined>(
    (dateRange || defaultDate).to
  );
  const [fromTime, setFromTime] = useState<string>(() => {
    const initialDate = dateRange || defaultDate;
    return initialDate.from ? format(initialDate.from, 'HH:mm:ss') : '00:00:00';
  });
  const [toTime, setToTime] = useState<string>(() => {
    const initialDate = dateRange || defaultDate;
    return initialDate.to ? format(initialDate.to, 'HH:mm:ss') : '23:59:59';
  });

  const handleTimeOptionSelect = (option: string) => {
    setSelectedTimeOption(option);
    const now = new Date();
    let fromDate: Date;

    switch (option) {
      case '最近 5 分钟':
        fromDate = addMinutes(now, -5);
        break;
      case '最近 15 分钟':
        fromDate = addMinutes(now, -15);
        break;
      case '最近 30 分钟':
        fromDate = addMinutes(now, -30);
        break;
      case '最近 1 小时':
        fromDate = addHours(now, -1);
        break;
      case '最近 3 小时':
        fromDate = addHours(now, -3);
        break;
      case '最近 6 小时':
        fromDate = addHours(now, -6);
        break;
      case '最近 24 小时':
        fromDate = addHours(now, -24);
        break;
      case '最近 2 天':
        fromDate = addDays(now, -2);
        break;
      case '最近 3 天':
        fromDate = addDays(now, -3);
        break;
      case '最近 7 天':
        fromDate = addDays(now, -7);
        break;
      default:
        fromDate = addMinutes(now, -30);
    }

    // 重置时分秒为整点或合理的默认值
    const resetFromDate = new Date(fromDate);
    const resetToDate = new Date(now);

    // 对于短时间范围（小于1小时），保持分钟精度
    if (option.includes('分钟')) {
      resetFromDate.setSeconds(0, 0);
      resetToDate.setSeconds(0, 0);
    } else {
      // 对于较长时间范围，重置为整点
      resetFromDate.setMinutes(0, 0, 0);
      resetToDate.setMinutes(0, 0, 0);
    }

    setSelectedFromDate(resetFromDate);
    setSelectedToDate(resetToDate);
    setFromTime(format(resetFromDate, 'HH:mm:ss'));
    setToTime(format(resetToDate, 'HH:mm:ss'));
  };

  useEffect(() => {
    if (dateRange) {
      setRange(dateRange);
      setSelectedFromDate(dateRange.from);
      setSelectedToDate(dateRange.to);

      // 提取并设置时间
      if (dateRange.from) {
        const fromTimeString = format(dateRange.from, 'HH:mm:ss');
        setFromTime(fromTimeString);
      }
      if (dateRange.to) {
        const toTimeString = format(dateRange.to, 'HH:mm:ss');
        setToTime(toTimeString);
      }

      // 当外部更新dateRange时，重置时间快捷选择状态
      setSelectedTimeOption('');
    }
  }, [dateRange]);

  useEffect(() => {
    if (selectedFromDate && selectedToDate) {
      const [fromHour, fromMinute, fromSecond] = fromTime.split(':').map(Number);
      const [toHour, toMinute, toSecond] = toTime.split(':').map(Number);

      const fromDateTime = new Date(selectedFromDate);
      fromDateTime.setHours(fromHour, fromMinute, fromSecond, 0);

      const toDateTime = new Date(selectedToDate);
      toDateTime.setHours(toHour, toMinute, toSecond, 999);

      const newRange = {
        from: fromDateTime,
        to: toDateTime
      };
      setRange(newRange);
      onChange?.(newRange);
    }
  }, [selectedFromDate, selectedToDate, fromTime, toTime, onChange]);

  const formatSelected = useMemo(() => {
    if (range?.from && range.to) {
      return `${format(range.from, 'y-MM-dd HH:mm:ss')} ~ ${format(range.to, 'y-MM-dd HH:mm:ss')}`;
    }
    return `${format(new Date(), 'y-MM-dd HH:mm:ss')} ~ ${format(new Date(), 'y-MM-dd HH:mm:ss')}`;
  }, [range]);

  useOutsideClick({
    ref: OutRangeRef,
    handler: () => {
      setShowSelected(false);
    }
  });

  return (
    <Box position={'relative'} ref={OutRangeRef}>
      <Flex
        border={theme.borders.base}
        px={3}
        py={1}
        borderRadius={'sm'}
        cursor={'pointer'}
        bg={'myGray.50'}
        fontSize={'sm'}
        onClick={() => setShowSelected(true)}
      >
        <Box color={'myGray.600'} fontWeight={'400'}>
          {formatSelected}
        </Box>
        <MyIcon ml={2} name={'date'} w={'16px'} color={'myGray.600'} />
      </Flex>
      {showSelected && (
        <Card
          position={'absolute'}
          zIndex={1}
          css={{
            '--rdp-background-color': '#d6e8ff',
            ' --rdp-accent-color': '#0000ff'
          }}
          p={2}
          minW={'520px'}
          {...(position === 'top'
            ? {
                bottom: '40px'
              }
            : {})}
        >
          <Flex gap={4} mb={2}>
            <Box>
              <DayPicker
                locale={zhCN}
                mode="range"
                defaultMonth={defaultDate.from}
                selected={{ from: selectedFromDate, to: selectedToDate }}
                disabled={[
                  { from: new Date(2022, 3, 1), to: addDays(new Date(), -90) },
                  { from: addDays(new Date(), 1), to: new Date(2099, 1, 1) }
                ]}
                onSelect={(range) => {
                  if (range) {
                    setSelectedFromDate(range.from);
                    setSelectedToDate(range.to);
                    // 当用户手动选择日期时，重置时间快捷选择状态
                    setSelectedTimeOption('');

                    // 重置时间为默认值
                    if (range.from) {
                      // 开始时间设置为当天的 00:00:00
                      const fromDateWithTime = new Date(range.from);
                      fromDateWithTime.setHours(0, 0, 0, 0);
                      setFromTime('00:00:00');
                    }

                    if (range.to) {
                      // 结束时间设置为当天的 23:59:59
                      const toDateWithTime = new Date(range.to);
                      toDateWithTime.setHours(23, 59, 59, 999);
                      setToTime('23:59:59');
                    }
                  }
                }}
              />
            </Box>

            {/* Time Options Sidebar */}
            <Box w={'160px'} borderLeft={'1px solid'} borderColor={'gray.200'} pl={3}>
              <Flex flexDirection={'column'} gap={1}>
                {timeOptions.map((option) => (
                  <Box
                    key={option}
                    h={'32px'}
                    px={2}
                    py={1}
                    borderRadius={'4px'}
                    fontSize={'12px'}
                    color={'gray.800'}
                    cursor={'pointer'}
                    bg={selectedTimeOption === option ? 'gray.100' : 'transparent'}
                    _hover={{ bg: 'gray.50' }}
                    display={'flex'}
                    alignItems={'center'}
                    onClick={() => handleTimeOptionSelect(option)}
                  >
                    {option}
                  </Box>
                ))}
              </Flex>
            </Box>
          </Flex>

          {/* Time Range Selector */}
          <Box borderTop={'1px solid'} borderColor={'gray.200'} pt={2} pb={2} px={4}>
            <Flex flexDirection={'column'} gap={1}>
              {[
                {
                  label: '开始',
                  date: selectedFromDate ? format(selectedFromDate, 'yyyy-MM-dd') : '',
                  time: fromTime,
                  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    setFromTime(e.target.value);
                    // 重置时间快捷选择状态
                    setSelectedTimeOption('');
                  }
                },
                {
                  label: '结束',
                  date: selectedToDate ? format(selectedToDate, 'yyyy-MM-dd') : '',
                  time: toTime,
                  onTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                    setToTime(e.target.value);
                    // 重置时间快捷选择状态
                    setSelectedTimeOption('');
                  }
                }
              ].map((item, index) => (
                <Box key={index} h={'32px'} display={'flex'} alignItems={'center'} gap={2}>
                  <Text
                    fontSize={'12px'}
                    color={'gray.600'}
                    fontWeight={400}
                    lineHeight={'16px'}
                    w={'32px'}
                    flexShrink={0}
                  >
                    {item.label}
                  </Text>
                  <Flex gap={1} flex={1}>
                    <Card
                      flex={1}
                      p={0}
                      border={'1px solid'}
                      borderColor={'gray.200'}
                      borderRadius={'4px'}
                      h={'32px'}
                    >
                      <Input
                        border={'none'}
                        h={'full'}
                        px={3}
                        py={1}
                        fontSize={'12px'}
                        color={'gray.900'}
                        value={item.date}
                        readOnly
                        bg={'transparent'}
                      />
                    </Card>
                    <Card
                      flex={1}
                      p={0}
                      border={'1px solid'}
                      borderColor={'gray.200'}
                      borderRadius={'4px'}
                      h={'32px'}
                    >
                      <Input
                        border={'none'}
                        h={'full'}
                        px={2}
                        py={1}
                        fontSize={'12px'}
                        color={'gray.900'}
                        value={item.time}
                        onChange={item.onTimeChange}
                        type="time"
                        step="1"
                        bg={'transparent'}
                      />
                    </Card>
                  </Flex>
                </Box>
              ))}
            </Flex>
          </Box>

          <Flex justifyContent={'space-between'} alignItems={'center'}>
            <Button
              variant={'outline'}
              size={'md'}
              onClick={() => {
                onRestore?.();
                // 重置到当天的00:00:00到23:59:59
                const today = new Date();

                // 开始时间：今天的00:00:00
                const todayStart = new Date(today);
                todayStart.setHours(0, 0, 0, 0);

                // 结束时间：今天的23:59:59
                const todayEnd = new Date(today);
                todayEnd.setHours(23, 59, 59, 999);

                setSelectedFromDate(todayStart);
                setSelectedToDate(todayEnd);
                setFromTime('00:00:00');
                setToTime('23:59:59');

                // 重置时间快捷选择状态
                setSelectedTimeOption('');

                // 更新range状态
                const newRange = {
                  from: todayStart,
                  to: todayEnd
                };
                setRange(newRange);
              }}
            >
              Restore2
            </Button>
            <Flex gap={2}>
              <Button variant={'outline'} size={'md'} onClick={() => setShowSelected(false)}>
                {t('common:Close')}
              </Button>
              <Button
                size={'md'}
                onClick={() => {
                  onSuccess?.(range || defaultDate);
                  setShowSelected(false);
                }}
              >
                {t('common:Confirm')}
              </Button>
            </Flex>
          </Flex>
        </Card>
      )}
    </Box>
  );
};

export default DateRangePicker;
export type DateRangeType = DateRange;
