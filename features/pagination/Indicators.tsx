import React from "react";
import { View, ViewProps } from "tamagui";
import Indicator, { IndicatorProps } from "./Indicator";

export type IndicatorsProps = ViewProps &
  Omit<IndicatorProps, "pageIndex"> & {
    pageCount: number;
  };

export default React.memo(function Indicators({
  pageCount,
  scrollX,
  pageWidth,
  size,
  outOfViewScale,
  ...props
}: IndicatorsProps): React.ReactNode {
  const keys = React.useMemo(
    () => Array.from({ length: pageCount }, (_, i) => i),
    [pageCount]
  );

  return (
    <View items="center" flexDirection="row" justify="center" {...props}>
      {keys.map((key) => (
        <Indicator
          key={key}
          scrollX={scrollX}
          pageWidth={pageWidth}
          pageIndex={key}
          size={size}
          outOfViewScale={outOfViewScale}
          mx="$space.1"
        />
      ))}
    </View>
  );
});
