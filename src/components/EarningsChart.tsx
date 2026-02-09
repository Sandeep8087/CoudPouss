import React from "react";
import { View, Dimensions, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import Text from "./Text";
import Svg, {
    Path,
    Line,
    G,
    Text as SvgText,
    Defs,
    LinearGradient,
    Stop,
} from "react-native-svg";
import * as d3 from "d3-shape";
import * as scale from "d3-scale";
import { getScaleSize } from "../constant";
import { FONTS, IMAGES } from "../assets";

const WIDTH = Dimensions.get('window').width - getScaleSize(66);
const HEIGHT = getScaleSize(227);
const PADDING = getScaleSize(30);

const EarningsChart = ({ data, onMonthPress }: any) => {

    if (!data || !data.weeks || data.weeks.length === 0) {
        return (
            <View style={{ justifyContent: 'center', alignItems: 'center', height: HEIGHT }}>
                <ActivityIndicator size="large" color="#4A90E2" />
            </View >
        );
    }

const allDays = data.weeks.flatMap((w: any) =>
    w.days.map((d: any) => ({
        key: d.day,
        x: d.day,
        y: d.amount,
    }))
);

const maxY = Math.max(...allDays.map((d: any) => d.y)) + 10;
const minY = 0;

const xScale = scale.scaleLinear()
    .domain([1, allDays.length])
    .range([PADDING + 20, WIDTH - PADDING]);

const yScale = scale.scaleLinear()
    .domain([minY, maxY])
    .range([HEIGHT - PADDING, PADDING]);

// Line path
const linePath = d3.line<any>()
    .x((d: any, i: number) => xScale(i + 1))
    .y((d: any) => yScale(d.y))
    .curve(d3.curveCatmullRom.alpha(0.6))(allDays);

// Area path (for gradient)
const areaPath = `
    ${linePath}
    L ${WIDTH - PADDING} ${HEIGHT - PADDING}
    L ${PADDING + 20} ${HEIGHT - PADDING}
    Z
  `;

const yTicks = 5;
const yTickValues = Array.from({ length: yTicks + 1 }, (_, i) =>
    Math.round((maxY / yTicks) * i)
);

return (
    <View style={{ padding: getScaleSize(24) }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text
                size={getScaleSize(16)}
                font={FONTS.Lato.Bold}
                color="#2C6587">Earnings</Text>
            <TouchableOpacity
                style={{ padding: getScaleSize(10), borderRadius: getScaleSize(10), backgroundColor: '#EAF0F3', flexDirection: 'row', alignItems: 'center' }}
                onPress={onMonthPress}>
                <Text
                    size={getScaleSize(12)}
                    font={FONTS.Lato.SemiBold}
                    color="#2C6587">{data?.month ?? ''}
                </Text>
                <Image source={IMAGES.down} style={{ marginLeft: getScaleSize(12), width: getScaleSize(24), height: getScaleSize(24) }} resizeMode="contain" />
            </TouchableOpacity>
        </View>

        <Svg width={WIDTH} height={HEIGHT}>
            <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor="#ABDAF6" stopOpacity="0.55" />
                    <Stop offset="100%" stopColor="#ABDAF6" stopOpacity="0" />
                </LinearGradient>
            </Defs>

            {/* Y dotted grid */}
            {yTickValues.map((val, i) => (
                <G key={i}>
                    <SvgText

                        x={getScaleSize(8)}
                        y={yScale(val) + getScaleSize(4)}
                        fontSize={getScaleSize(10)}
                        fill="#595959"
                    >
                        {val}
                    </SvgText>
                </G>
            ))}

            {/* Area */}
            <Path
                d={areaPath}
                fill="url(#grad)"
            />

            {/* Line */}
            <Path
                d={linePath!}
                stroke="#2C6587"
                strokeWidth={2.5}
                fill="none"
            />

            {/* X labels (Weeks) */}
            {data.weeks.map((w: any, i: number) => {
                const midIndex = i * 7 + 4;
                return (
                    <>
                        <Line
                            key={i}
                            x1={i == 0 ? PADDING + 20 : xScale(midIndex) - PADDING}
                            y1={20}
                            x2={i == 0 ? PADDING + 20 : xScale(midIndex) - PADDING}
                            y2={HEIGHT - 30}
                            stroke="#E5E5E5"
                            strokeDasharray="4 4"
                        />
                        <SvgText
                            key={i}
                            x={i == 0 ? PADDING + 20 : xScale(midIndex) - PADDING}
                            y={HEIGHT - 1}
                            fontSize={getScaleSize(11)}
                            fill="#595959"
                            textAnchor="middle"
                        >
                            {w.label}
                        </SvgText>
                    </>
                );
            })}
        </Svg>
    </View>
);
};

export default EarningsChart;