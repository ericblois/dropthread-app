import React from "react";
import { Animated, GestureResponderEvent, Pressable, PressableProps, StyleSheet, ViewStyle } from "react-native";
import FastImage, { FastImageProps, ImageStyle, Source } from "react-native-fast-image";
import { colors, defaultStyles, icons, styleValues } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";

type ImageAnimatedProps = {
  source: Source,
  style?: ViewStyle,
  imageStyle?: ImageStyle,
  onPress?: (event?: GestureResponderEvent) => void,
  onLoad?: (width: number, height: number) => void
  pressableProps?: PressableProps,
  imageProps?: Partial<FastImageProps>
}

type State = {
    loaded: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedFastImage = Animated.createAnimatedComponent(FastImage);

export default class ImageAnimated extends CustomComponent<ImageAnimatedProps, State> {

  constructor(props: ImageAnimatedProps) {
    super(props)
    this.state = {
        loaded: false
    }
  }

  placeHolderOpacity = new Animated.Value(1)
  imageOpacity = new Animated.Value(0)
  fadeTime = 500

  showImage() {
      Animated.sequence([
          Animated.timing(this.placeHolderOpacity, {
              toValue: 0,
              duration: this.fadeTime/2,
              useNativeDriver: true
          }),
          Animated.timing(this.imageOpacity, {
            toValue: 1,
            duration: this.fadeTime/2,
            useNativeDriver: true
        })
      ]).start(() => this.setState({loaded: true}))
  }

  render() {
    return (
      <Pressable
        style={({pressed}) => ({
          overflow: "hidden",
            ...imageAnimatedStyles.container,
            ...this.props.style
        })}
        disabled={!this.state.loaded}
        onPress={this.props.onPress}
        {...this.props.pressableProps}
      >
          <AnimatedFastImage
            {...this.props.imageProps}
            source={this.props.source}
            style={{
              ...defaultStyles.fill,
              opacity: this.imageOpacity,
              ...this.props.imageStyle,
              tintColor: undefined
            }}
            tintColor={this.props.imageStyle?.tintColor}
            resizeMode={"cover"}
            onLoad={(e) => {
              this.showImage()
              if (this.props.onLoad) {
                  this.props.onLoad(e.nativeEvent.width, e.nativeEvent.height)
              }
            }}
          />
          {!this.state.loaded ? 
            <Animated.View
                style={{
                    ...defaultStyles.fill,
                    borderRadius: this.props.style?.borderRadius,
                    backgroundColor: colors.lightestGrey,
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: this.placeHolderOpacity
                }}
            >
                <FastImage
                    source={icons.image}
                    style={{
                        width: styleValues.iconSmallSize,
                        height: styleValues.iconSmallSize
                    }}
                    tintColor={colors.lightGrey}
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

    }
})