import React from "react";
import { Animated, GestureResponderEvent, Image, ImageProps, ImageSourcePropType, ImageStyle, Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native";
import { colors, icons, styleValues } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type ImageAnimatedProps = {
  source: ImageSourcePropType,
  style?: ViewStyle,
  imageStyle?: ImageStyle,
  onPress?: (event?: GestureResponderEvent) => void,
  onLoad?: (width: number, height: number) => void
  pressableProps?: PressableProps,
  imageProps?: Partial<ImageProps>
}

type State = {
    loaded: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default class ImageAnimated extends CustomComponent<ImageAnimatedProps, State> {

  constructor(props: ImageAnimatedProps) {
    super(props)
    this.state = {
        loaded: false
    }
  }

  placeHolderOpacity = new Animated.Value(1)
  imageOpacity = new Animated.Value(0)
  fadeTime = 200

  showImage() {
      Animated.sequence([
          Animated.timing(this.placeHolderOpacity, {
              toValue: 0,
              duration: this.fadeTime/2,
              useNativeDriver: false
          }),
          Animated.timing(this.imageOpacity, {
            toValue: 1,
            duration: this.fadeTime/2,
            useNativeDriver: false
        })
      ]).start(() => this.setState({loaded: true}))
  }

  render() {
    return (
      <Pressable
        style={({pressed}) => ({
            ...imageAnimatedStyles.container,
            ...this.props.style
        })}
        disabled={!this.state.loaded}
        onPress={this.props.onPress}
        {...this.props.pressableProps}
      >
          <Animated.Image
            source={this.props.source}
            style={{
                ...imageAnimatedStyles.fillView,
                opacity: this.imageOpacity,
                ...this.props.imageStyle
            }}
            resizeMethod={"scale"}
            resizeMode={"cover"}
            onLoad={(e) => {
                this.showImage()
                if (this.props.onLoad) {
                    this.props.onLoad(e.nativeEvent.source.width, e.nativeEvent.source.height)
                }
            }}
            {...this.props.imageProps}
          />
          {!this.state.loaded ? 
            <Animated.View
                style={{
                    ...imageAnimatedStyles.fillView,
                    borderRadius: this.props.style?.borderRadius,
                    backgroundColor: colors.lightestGrey,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: this.placeHolderOpacity
                }}
            >
                <Image
                    source={icons.image}
                    style={{
                        width: styleValues.iconSmallSize,
                        height: styleValues.iconSmallSize,
                        tintColor: colors.lightGrey
                    }}
                    resizeMethod={"scale"}
                    resizeMode={"contain"}
                />
            </Animated.View> : 
            undefined}
            {this.props.children}
      </Pressable>
    )
  }
}

export const imageAnimatedStyles = StyleSheet.create({
    container: {

    },
    fillView: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
    }
})