import { Animated, Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native"
import { colors, shadowStyles, styleValues } from "../HelperFiles/StyleSheet"
import CustomComponent from "./CustomComponent"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type CustomPressableProps = PressableProps & {
    style?: Animated.AnimatedProps<ViewStyle>,
    animationType?: "opacity" | "shadowSmall" | "shadow" | "outline",
    animationTime?: number
}

type CustomPressableState = {
}

export default class ViewLikesPage extends CustomComponent<CustomPressableProps, CustomPressableState> {

    progress = new Animated.Value(0);
    animationTime: number;
    
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>} = {
        opacity: {
            opacity: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.6]
            })
        },
        shadowSmall: {
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
        shadow: {
            shadowOffset: {
                width: 0,
                height: 0,
            },
            shadowOpacity: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [shadowStyles.medium.shadowOpacity, shadowStyles.large.shadowOpacity]
            }),
            elevation: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [shadowStyles.medium.elevation, shadowStyles.medium.elevation - 1]
            }),
            shadowRadius: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [shadowStyles.medium.shadowRadius, shadowStyles.medium.shadowRadius*0.5]
            }),
            transform: [{
                scale: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.99]
                })
            }]
        },
        outline: {
            borderWidth: styleValues.mediumBorderWidth,
            borderRadius: styleValues.mediumPadding,
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
            <AnimatedPressable
                {...this.props}
                style={[animatedPressableStyle.container, this.animatedStyles[this.props.animationType || "opacity"], this.props.style]}
                onPressIn={(e) => {
                    this.animatePressIn();
                    if (this.props.onPressIn) {
                        this.props.onPressIn(e)
                    }
                }}
                onPressOut={(e) => {
                    this.animatePressOut()
                    if (this.props.onPressOut) {
                        this.props.onPressOut(e)
                    }
                }}
            >
                {this.props.children}
            </AnimatedPressable>
        )
    }
}

export const animatedPressableStyle = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
    }
})