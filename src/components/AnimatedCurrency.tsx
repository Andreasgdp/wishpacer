import React from 'react';
import NumberFlow, { Format } from '@number-flow/react';
import type { CurrencyConfig } from '../types/plan';
import { DEFAULT_GLOBAL_SETTINGS } from '../utils/defaults';

interface AnimatedCurrencyProps {
  value: number;
  currency?: CurrencyConfig;
  className?: string;
  format?: Format;
}

export const AnimatedCurrency: React.FC<AnimatedCurrencyProps> = ({
  value,
  currency = DEFAULT_GLOBAL_SETTINGS.currency,
  className,
  format,
}) => {
  const prefix = currency?.position === 'prefix' ? currency?.symbol : undefined;
  const suffix = currency?.position === 'suffix' ? ` ${currency?.symbol}` : undefined;

  return (
    <NumberFlow
      value={value}
      prefix={prefix}
      suffix={suffix}
      format={{
        maximumFractionDigits: currency?.decimals ?? 0,
        ...format,
      }}
      className={className}
      transformTiming={{ duration: 500, easing: 'ease-out' }}
      spinTiming={{ duration: 500, easing: 'ease-out' }}
      isolate
    />
  );
};
