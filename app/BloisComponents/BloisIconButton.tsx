import React, { Component } from "react";
import {
    GestureResponderEvent,
    PressableProps, TextStyle, ViewStyle
} from "react-native";
import {
    colors,
    defaultStyles, styVals
} from "../HelperFiles/StyleSheet";
import * as Icons from "@expo/vector-icons";
import { Icon, IconProps } from "@expo/vector-icons/build/createIconSet";
import BloisPressable from "./BloisPressable";

type BloisIconButtonProps = {
    icon: IconSelect,
    style?: ViewStyle;
    iconStyle?: TextStyle;
    onPress?: (event: GestureResponderEvent) => void | Promise<void>;
    pressableProps?: PressableProps;
    animType?: "shadow" | "opacity" | "shadowSmall" | "outline",
    tooltip?: {
        text: string;
        posX?: "center" | "left" | "right";
        posY?: "above" | "below"
        width?: number;
    };
    children?: React.ReactNode;
};

type State = {};

export default class BloisIconButton extends Component<BloisIconButtonProps, State> {

    DCIcon;

    constructor(props: BloisIconButtonProps) {
        super(props)
        this.DCIcon = Icons[this.props.icon.type] as Icon<
            typeof this.props.icon.name,
            typeof this.props.icon.type
        >;
    }

    render() {
        const DCIcon = Icons[this.props.icon.type] as Icon<
            typeof this.props.icon.name,
            typeof this.props.icon.type
        >;
        return (
            <BloisPressable
                style={{
                    ...(this.props.animType !== "opacity"
                        ? defaultStyles.roundedBox
                        : undefined),
                    width: styVals.smallHeight,
                    alignContent: "center",
                    justifyContent: "center",
                    aspectRatio: 1,
                    ...this.props.style,
                }}
                animType={this.props.animType || 'shadowSmall'}
                tooltip={this.props.tooltip}
                onPress={this.props.onPress}
            >
                <DCIcon
                    adjustsFontSizeToFit
                    {...this.props.icon.iconProps}
                    name={this.props.icon.name}
                    type={this.props.icon.type}
                    style={{
                        height: "100%",
                        width: "100%",
                        textAlign: "center",
                        textAlignVertical: "center",
                        color: colors.darkGrey,
                        aspectRatio: 1,
                        fontSize:
                            (this.props.style?.width as number) |
                            (this.props.style?.height as number) |
                            styVals.smallHeight,
                        ...this.props.iconStyle,
                    }}
                />
                {this.props.children}
            </BloisPressable>
        );
    }
}

export type IconSelect =
    {
          type: "AntDesign";
          name: keyof typeof Icons.AntDesign.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.AntDesign.glyphMap>>;
      }
    | {
          type: "Entypo";
          name: keyof typeof Icons.Entypo.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Entypo.glyphMap>>;
      }
    | {
          type: "EvilIcons";
          name: keyof typeof Icons.EvilIcons.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.EvilIcons.glyphMap>>;
      }
    | {
          type: "Feather";
          name: keyof typeof Icons.Feather.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Feather.glyphMap>>;
      }
    | {
          type: "FontAwesome";
          name: keyof typeof Icons.FontAwesome.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.FontAwesome.glyphMap>
          >;
      }
    | {
          type: "Fontisto";
          name: keyof typeof Icons.Fontisto.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Fontisto.glyphMap>>;
      }
    | {
          type: "Foundation";
          name: keyof typeof Icons.Foundation.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.Foundation.glyphMap>
          >;
      }
    | {
          type: "Ionicons";
          name: keyof typeof Icons.Ionicons.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Ionicons.glyphMap>>;
      }
    | {
          type: "MaterialCommunityIcons";
          name: keyof typeof Icons.MaterialCommunityIcons.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.MaterialCommunityIcons.glyphMap>
          >;
      }
    | {
          type: "MaterialIcons";
          name: keyof typeof Icons.MaterialIcons.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.MaterialIcons.glyphMap>
          >;
      }
    | {
          type: "Octicons";
          name: keyof typeof Icons.Octicons.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Octicons.glyphMap>>;
      }
    | {
          type: "SimpleLineIcons";
          name: keyof typeof Icons.SimpleLineIcons.glyphMap;
          iconProps?: Partial<
              IconProps<keyof typeof Icons.SimpleLineIcons.glyphMap>
          >;
      }
    | {
          type: "Zocial";
          name: keyof typeof Icons.Zocial.glyphMap;
          iconProps?: Partial<IconProps<keyof typeof Icons.Zocial.glyphMap>>;
      };
