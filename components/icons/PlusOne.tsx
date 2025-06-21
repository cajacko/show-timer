import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { IconProps } from "@tamagui/helpers-icon";
import { themed } from "@tamagui/helpers-icon";

const PlusOne = themed(
  React.memo(function PlusOne(props: IconProps) {
    const { color = "black", size = 24, ...otherProps } = props as any;

    return (
      <Svg
        width={size}
        height={size}
        stroke={color}
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 498.85 433.74"
        {...otherProps}
      >
        <Path
          fill={color}
          d="M498.85 0v433.74h-66.29V80.15c-28.11 5.61-55.53 11.09-83.5 16.67V72.44c0-10.41.15-20.83-.09-31.24-.07-3.47 1.12-4.68 4.42-5.48 47.42-11.5 94.8-23.16 142.19-34.79 1.1-.27 2.18-.62 3.27-.93ZM332.09 233.46v66.63H199.53v133.3h-66.61V300.13H0v-66.52h132.65V100.65h66.64v132.81h132.8z"
        />
      </Svg>
    );
  })
);

export default PlusOne;
