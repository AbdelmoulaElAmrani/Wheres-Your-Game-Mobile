import * as React from "react"
import Svg, {SvgProps, Path} from "react-native-svg"

const BusinessIconV2 = (props: SvgProps) => (
    <Svg
        width={50}
        height={50}
        fill="none" {...props}>
        <Path
            // @ts-ignore
            stroke={props.fillColor}
            strokeLinecap="square"
            strokeMiterlimit={10}
            strokeWidth={2}
            d="M42.038 12.801H6.962a3.9 3.9 0 0 0-3.9 3.9v23.377a3.9 3.9 0 0 0 3.9 3.9h35.076a3.9 3.9 0 0 0 3.9-3.9V16.7a3.9 3.9 0 0 0-3.9-3.9Z"
        />
        <Path
            // @ts-ignore
            stroke={props.fillColor}
            strokeMiterlimit={10}
            strokeWidth={2}
            d="M28.4 26.542h9.738a7.78 7.78 0 0 0 7.8-7.881v-2.042a3.9 3.9 0 0 0-3.9-3.9H6.962a3.9 3.9 0 0 0-3.9 3.982v2.041a7.778 7.778 0 0 0 7.8 7.8H28.4Z"
        />
        <Path
            // @ts-ignore
            stroke={props.fillColor}
            strokeLinecap="square"
            strokeMiterlimit={10}
            strokeWidth={2}
            d="M24.5 24.5v3.9M32.3 12.801H16.7l1.96-7.778h11.68L32.3 12.8Z"
        />
    </Svg>
)
export default BusinessIconV2
