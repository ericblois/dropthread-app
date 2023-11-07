import React, { Component } from "react";
import {
    Animated,
    GestureResponderEvent,
    PressableProps, Text, TextStyle, View, ViewStyle
} from "react-native";
import {
    colors,
    defaultStyles, shadowStyles, styVals, textStyles
} from "../HelperFiles/StyleSheet";
import * as Icons from "@expo/vector-icons";
import { Icon, IconProps } from "@expo/vector-icons/build/createIconSet";
import BloisPressable from "./BloisPressable";
import { BloisTextButton, CustomModal } from "../HelperFiles/CompIndex";
import { Coords, ReverseGeocodeResult } from "../HelperFiles/DataTypes";
import MapView, { Circle, MapMarker, Marker, Overlay, PROVIDER_GOOGLE, Polygon } from "react-native-maps"
import User from "../HelperFiles/User";
import { hexToRGBA } from "../HelperFiles/ClientFunctions";
import { reverseGeocode } from "../HelperFiles/Constants";

type BloisLocationSelectorProps = {
    defaultLocation?: Coords,
    style?: ViewStyle;
    mapStyle?: ViewStyle;
    disclaimer?: string;
    indicatorType?: 'shadowSmall' | 'shadow' | 'outline',
    showInitialValidity?: boolean,
    onChangeLocation?: (coords: Coords, geocodeResult?: ReverseGeocodeResult) => void,
};

type State = {
    showMap: boolean,
    userCoords: Coords,
    selection?: Coords,
    address?: string
};

export default class BloisLocationSelector extends Component<BloisLocationSelectorProps, State> {

    progress: Animated.Value;
    animationTime = 250
    
    animatedStyles: {[type: string]: Animated.AnimatedProps<ViewStyle>};


    constructor(props: BloisLocationSelectorProps) {
        super(props)
        this.state = {
            showMap: false,
            userCoords: {lat: 0, long: 0},
            selection: props.defaultLocation
        }
        User.getLocation().then((coords) => this.setState({userCoords: coords}))

        this.progress = new Animated.Value(props.showInitialValidity ? (props.defaultLocation ? 1 : 0) : 1)
        this.animatedStyles = {
            shadowSmall: {
                ...(shadowStyles.small),
                shadowOpacity: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, shadowStyles.small.shadowOpacity]
                }),
                shadowColor: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.black]
                })
            },
            shadow: {
                ...shadowStyles.medium,
                shadowOpacity: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, shadowStyles.medium.shadowOpacity]
                }),
                shadowColor: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.black]
                })
            },
            outline: {
                borderWidth: styVals.minorBorderWidth,
                borderRadius: styVals.mediumPadding,
                borderColor: this.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.invalid, colors.transparent]
                })
            }
        }
    }

    animValid = (callback?: () => void) => {
        Animated.timing(this.progress, {
            toValue: 1,
            duration: this.animationTime,
            useNativeDriver: false
        }).start(callback)
    }

    animInvalid = (callback?: () => void) => {
        Animated.timing(this.progress, {
            toValue: 0,
            duration: this.animationTime,
            useNativeDriver: false
        }).start(callback)
    }

    render() {
        // Check validity of input
        if (this.props.showInitialValidity) {
            if (this.state.selection) {
                this.animValid()
            } else {
                this.animInvalid()
            }
        }
        return (
            <>
                <BloisTextButton
                    text={'Set location'}
                    subtext={this.state.address || 'Not set'}
                    style={{
                        ...(this.animatedStyles[this.props.indicatorType || 'shadowSmall']),
                        justifyContent: 'space-between',
                        paddingVertical: styVals.mediumPadding,
                        ...this.props.style
                    }}
                    textStyle={{textAlign: 'left'}}
                    subtextStyle={{textAlign: 'left'}}
                    rightChildren={(
                        <Icons.Entypo
                            name={'location-pin'}
                            style={{
                                fontSize: styVals.iconMediumSize,
                            }}
                        />
                    )}
                    onPress={() => this.setState({showMap: true})}
                />
                {this.props.disclaimer ?
                <Text style={{
                    ...(textStyles.small),
                    color: colors.grey,
                    textAlign: 'left',
                    marginBottom: styVals.mediumPadding
                }}>{this.props.disclaimer}</Text>
                : undefined}
                <CustomModal
                    visible={this.state.showMap}
                    onClose={() => {
                        this.setState({showMap: false})
                        if (this.state.selection) {
                            this.animValid()
                        } else if (!this.state.selection) {
                            this.animInvalid()
                        }
                    }}
                >
                    <View>
                        <MapView
                            style={{
                                ...defaultStyles.roundedBox,
                                ...shadowStyles.small,
                                width: '100%',
                                aspectRatio: 1
                            }}
                            onRegionChange={(region) => {
                                this.setState({
                                    selection: {
                                        lat: region.latitude,
                                        long: region.longitude
                                    }
                                })
                                console.log(region)
                            }}
                            initialRegion={{
                                latitude: this.props.defaultLocation?.lat || this.state.userCoords.lat,
                                longitude: this.props.defaultLocation?.long || this.state.userCoords.long,
                                latitudeDelta: 0.02,
                                longitudeDelta: 0.02
                            }}
                        ></MapView>
                        {/* Selection pin */}
                        <View
                            style={{
                                position: 'absolute',
                                bottom: '50%',
                                left: '40%',
                                width: '20%',
                                justifyContent: 'flex-end',
                                alignItems: 'center'
                            }}
                        >
                            <Icons.Entypo
                                name="location-pin"
                                style={{
                                    fontSize: styVals.largestTextSize*1.5,
                                    color: hexToRGBA(colors.black, 0.5),
                                    textAlign: 'center',
                                    textAlignVertical: 'bottom'
                                }}
                            />
                        </View>
                    </View>
                    <BloisTextButton
                        text={'Select this location'}
                        style={{
                            width: '100%'
                        }}
                        onPress={async () => {
                            if (this.state.selection) {
                                const geocode = await reverseGeocode(this.state.selection)
                                this.props.onChangeLocation?.(this.state.selection, geocode)
                                if (geocode?.address.label) {
                                    this.setState({address: geocode?.address.label, showMap: false})
                                }
                            }
                        }}
                    />
                </CustomModal>
            </>
        );
    }
}
