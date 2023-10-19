import { ActivityIndicator, Animated, GestureResponderEvent, Pressable, PressableProps, Text, View, ViewStyle } from "react-native";
import { colors, shadowStyles, styleValues, defaultStyles, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "../CustomComponents/CustomComponent";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type BloisPressableProps = {
    style?: Animated.AnimatedProps<ViewStyle>,
    animType?: "opacity" | "shadowSmall" | "shadow" | "outline",
    duration?: number,
    onPress?: (event: GestureResponderEvent) => void,
    pressableProps?: PressableProps,
    tooltip?: {
        text: string;
        posX?: "center" | "left" | "right";
        posY?: "above" | "below"
    };
}

type BloisPressableState = {
    showLoading: boolean;
    showInfo: boolean;
}

export default class BloisPressable extends CustomComponent<BloisPressableProps, BloisPressableState> {

    progress = new Animated.Value(0);
    duration: number;

    pressableWidth = 0;
    pressableHeight = 0;
    
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>} = {
        opacity: {
            opacity: this.progress.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0.6]
            })
        },
        shadowSmall: {
            ...shadowStyles.small,
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
            ...shadowStyles.medium,
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

    constructor(props: BloisPressableProps) {
        super(props)
        this.state = {
            showLoading: false,
            showInfo: false,
        };
        this.duration = props.duration || 75
    }

    animPressIn = () => {
        Animated.timing(this.progress, {
            toValue: 1,
            duration: this.duration,
            useNativeDriver: false
        }).start()
    }

    animPressOut = () => {
        Animated.timing(this.progress, {
            toValue: 0,
            duration: this.duration,
            useNativeDriver: false
        }).start()
    }

    renderInfo = () => {
        if (this.props.tooltip && this.state.showInfo) {
            const posY = this.props.tooltip.posY || "above";
            const posX = this.props.tooltip.posX || "center";
            return (
                <View
                    style={{
                        position: "absolute",
                        width: 0,
                        height: 0,
                        top: posY === "below" ? this.pressableHeight + styleValues.minorPadding : undefined,
                        bottom: posY === "above" ? this.pressableHeight + styleValues.minorPadding : undefined,
                        left: posX === "right" ? 0 : undefined,
                        right: posX === "left" ? 0 : undefined,
                        alignSelf: posX === "center" ? "center" : undefined,
                        elevation: 100,
                        zIndex: 100
                    }}
                >
                    <View
                        style={{
                            ...defaultStyles.roundedBox,
                            ...shadowStyles.small,
                            width: undefined,
                            marginBottom: undefined,
                            position: 'absolute',
                            top: posY === "below" ? 0 : undefined,
                            bottom: posY === "above" ? 0 : undefined,
                            left: posX === "right" ? 0 : undefined,
                            right: posX === "left" ? 0 : undefined,
                            alignSelf: posX === "center" ? "center" : undefined
                        }}
                    >
                        <Text style={{...textStyles.smaller}}>
                            {this.props.tooltip.text}
                        </Text>
                    </View>
                </View>
            );
        }
    };

    render() {
        return (
            <AnimatedPressable
                {...this.props.pressableProps}
                onLayout={(event) => {
                    this.pressableWidth = event.nativeEvent.layout.width
                    this.pressableHeight = event.nativeEvent.layout.height
                    this.props.pressableProps?.onLayout?.(event);
                }}
                style={{
                    flexGrow: 0,
                    ...this.animatedStyles[this.props.animType || "opacity"],
                    ...this.props.style
                }}
                onPressIn={(event) => {
                    this.animPressIn();
                    this.props.pressableProps?.onPressIn?.(event)
                }}
                onPress={async (event) => {
                    this.setState({showLoading: true})
                    await this.props.onPress?.(event)
                    this.setState({ showLoading: false})
                }}
                onLongPress={(event) => {
                    this.setState({ showInfo: true });
                    this.props.pressableProps?.onLongPress?.(event);
                }}
                onPressOut={(event) => {
                    this.animPressOut()
                    this.setState({ showInfo: false })
                    this.props.pressableProps?.onPressOut?.(event)
                }}
            >
                {this.props.children}
                {this.state.showLoading ? (
                    <Animated.View
                        style={{
                            ...defaultStyles.fill,
                            alignItems: "center",
                            justifyContent: "center",
                            borderRadius: this.props.style?.borderRadius,
                            backgroundColor: this.props.style?.backgroundColor
                        }}
                    >
                        <ActivityIndicator size={"small"} />
                    </Animated.View>
                ) : undefined}
                {this.renderInfo()}
            </AnimatedPressable>
        )
    }
}