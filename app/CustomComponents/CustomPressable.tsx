import { Animated, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from "react-native"
import { colors, defaultStyles, shadowStyles, styleValues } from "../HelperFiles/StyleSheet"
import CustomComponent from "./CustomComponent"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CustomPressableProps = PressableProps & {
    style: Animated.AnimatedProps<ViewStyle>,
    containerStyle?: PressableProps['style'],
    animationType?: "opacity" | "shadow" | "outline",
    animationTime?: number
}

type CustomPressableState = {
}

export default class LikesMainPage extends CustomComponent<CustomPressableProps, CustomPressableState> {

    progress = new Animated.Value(0);
    animationTime: number;
    
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>} = {
        opacity: {
            opacity: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.6]
            })
        },
        shadow: {
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [shadowStyles.small.shadowOpacity, shadowStyles.medium.shadowOpacity]
            }),
            elevation: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [shadowStyles.small.elevation, shadowStyles.small.elevation - 1]
            }),
            shadowRadius: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [shadowStyles.small.shadowRadius, shadowStyles.small.shadowRadius*0.5]
            }),
            transform: [{
                scale: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.99]
                })
            }]
        },
        outline: {
            borderColor: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [colors.transparent, colors.main]
            })
        }
    }

    constructor(props: CustomPressableProps) {
        super(props)
        this.state = {};
        this.animationTime = props.animationTime || 75
    }

    animatePressIn = () => {
        Animated.timing(this.progress, {
            toValue: 1,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    animatePressOut = () => {
        Animated.timing(this.progress, {
            toValue: 0,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    render() {
        return (
            <Pressable
                {...this.props}
                style={this.props.containerStyle}
                onPressIn={(e) => {
                    this.animatePressIn();
                    if (this.props.onPressIn) {
                        this.props.onPressIn(e)
                    }
                }}
                onPressOut={(e) => {
                    this.animatePressOut()
                    if (this.props.onPressIn) {
                        this.props.onPressIn(e)
                    }
                }}
            >
                <Animated.View
                    style={[animatedPressableStyle.container, this.animatedStyles[this.props.animationType || "opacity"], this.props.style]}
                >
                {this.props.children}
                </Animated.View>
            </Pressable>
        )
    }
}

export const animatedPressableStyle = StyleSheet.create({
    container: {
        ...defaultStyles.roundedBox,
        borderWidth: styleValues.mediumBorderWidth,
        borderColor: colors.transparent
    }
})