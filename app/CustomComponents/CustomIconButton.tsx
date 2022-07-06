import React from "react";
import { ActivityIndicator, Animated, GestureResponderEvent, Pressable, PressableProps, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import FastImage, { FastImageProps, ImageStyle, Source } from "react-native-fast-image";
import { colors, defaultStyles, shadowStyles, styleValues, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import CustomPressable from "./CustomPressable"
import * as Icons from "@expo/vector-icons"
import { Icon, GlyphMap, IconButtonProps, IconProps } from "@expo/vector-icons/build/createIconSet";

type IconName = keyof typeof Icons.AntDesign.glyphMap
  | keyof typeof Icons.Entypo.glyphMap
  | keyof typeof Icons.EvilIcons.glyphMap
  | keyof typeof Icons.Feather.glyphMap
  | keyof typeof Icons.FontAwesome.glyphMap
  | keyof typeof Icons.Fontisto.glyphMap
  | keyof typeof Icons.Foundation.glyphMap
  | keyof typeof Icons.Ionicons.glyphMap
  | keyof typeof Icons.MaterialCommunityIcons.glyphMap
  | keyof typeof Icons.MaterialIcons.glyphMap
  | keyof typeof Icons.Octicons.glyphMap
  | keyof typeof Icons.SimpleLineIcons.glyphMap
  | keyof typeof Icons.Zocial.glyphMap;

type IconType = "FontAwesome"
 | "Fontisto"
 | "AntDesign"
 | "Entypo"
 | "EvilIcons"
 | "Feather"
 | "FontAwesome5"
 | "Foundation"
 | "Ionicons"
 | "MaterialCommunityIcons"
 | "MaterialIcons"
 | "Octicons"
 | "SimpleLineIcons"
 | "Zocial"

type CustomIconButtonProps = {
  name: IconName,
  type: IconType,
  iconStyle?: StyleProp<TextStyle>,
  buttonStyle?: ViewStyle,
  onPress?: (event: GestureResponderEvent) => void | Promise<void>
  buttonProps?: CustomPressable['props'],
  iconProps?: Partial<IconProps<IconName>>,
  showLoading?: boolean,
  showBadge?: boolean,
  badgeNumber?: number,
  infoProps?: {
    text: string,
    positionHorizontal?: "center" | "left" | "right",
    positionVertical?: "above" | "below" | "beside",
    width?: number
  }
}

type State = {
  showLoading: boolean,
  showInfo: boolean
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default class CustomIconButton extends CustomComponent<CustomIconButtonProps, State> {

  constructor(props: CustomIconButtonProps) {
    super(props)
    this.state = {
      showLoading: false,
      showInfo: false
    }
  }

  renderInfo() {
    if (this.props.infoProps && this.state.showInfo) {
      const posVert = this.props.infoProps.positionVertical ? this.props.infoProps.positionVertical : "above"
      const posHor = this.props.infoProps.positionHorizontal ? this.props.infoProps.positionHorizontal : "center"
      const width = this.props.infoProps.width ? this.props.infoProps.width : this.props.infoProps.text.length*styleValues.mediumTextSize*0.65 + styleValues.mediumPadding*2
      let left = posHor === "right" ? 0 : undefined
      let right = posHor === "left" ? 0 : undefined
      if (posVert === "beside") {
        left = posHor === "left" ? -(width + styleValues.mediumPadding) : undefined
        right = posHor === "right" ? -(width + styleValues.mediumPadding) : undefined
      }
      return (
        <View
          style={{
            ...defaultStyles.roundedBox,
            ...shadowStyles.small,
            position: "absolute",
            width: width,
            top: posVert === "above" ? -(styleValues.smallHeight + styleValues.mediumPadding) : undefined,
            bottom: posVert === "below" ? -(styleValues.smallHeight + styleValues.mediumPadding) : undefined,
            left: left,
            right: right,
            alignSelf: posHor === "center" ? "center" : undefined,
          }}
        >
          <Text style={{
            ...textStyles.small,
          }}>{this.props.infoProps.text}</Text>
        </View>
      )
    }
  }

  render() {
    const Icon = Icons[this.props.type] as Icon<IconName, IconType>
    return (
        <CustomPressable
          style={[CustomIconButtonStyles.defaultButton, this.props.buttonStyle]}
          onPress={async (e) => {
            if (this.props.onPress) {
              if (this.props.showLoading === true) {
                this.setState({showLoading: true})
              }
              try {
                await this.props.onPress(e)
              } catch (e) {
                console.error(e)
              }
              if (this.props.showLoading === true) {
                this.setState({showLoading: false})
              }
            }
          }}
          onLongPress={() => this.setState({showInfo: true})}
          onPressOut={() => this.setState({showInfo: false})}
          animationType={'opacity'}
          {...this.props.buttonProps}
        >
          {!this.state.showLoading ? 
            <Icon
              adjustsFontSizeToFit
              {...this.props.iconProps}
              name={this.props.name}
              type={this.props.type}
              style={[
                CustomIconButtonStyles.defaultIcon,
                {
                  fontSize: (this.props.buttonStyle?.width as number) | (this.props.buttonStyle?.height as number) | styleValues.iconLargeSize
                },
                this.props.iconStyle
              ]}
            /> :
            <View
                style={{
                    ...defaultStyles.fill,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: styleValues.mediumPadding,
                    backgroundColor: "transparent",
                }}
              >
                  <ActivityIndicator
                      size={"small"}
                  />
              </View>
          }
          {/* Icon Badge */}
          {this.props.showBadge === true ? 
            <View style={{
              position: "absolute",
              height: styleValues.smallTextSize*4/3,
              minWidth: styleValues.smallTextSize*4/3,
              borderRadius: styleValues.smallTextSize*4/3,
              top: -styleValues.minorPadding,
              right: -styleValues.minorPadding,
              backgroundColor: colors.main,
              alignItems: "center",
              justifyContent: "center"
            }}>
              <Text style={{...textStyles.smaller, color: colors.white, marginHorizontal: styleValues.minorPadding}}>{`${this.props.badgeNumber}`}</Text>
            </View> : undefined
          }
          {this.renderInfo()}
        </CustomPressable>
    )
  }
}

export const CustomIconButtonStyles = StyleSheet.create({
  defaultButton: {
    alignContent: "center",
    justifyContent: "center",
    padding: undefined,
    marginBottom: undefined,
    aspectRatio: 1
  },
  defaultIcon: {
    height: "100%",
    width: "100%",
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.darkGrey,
    fontSize: styleValues.iconLargeSize,
    aspectRatio: 1
  }
})