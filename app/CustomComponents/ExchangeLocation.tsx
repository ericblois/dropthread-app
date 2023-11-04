import React from "react";
import { Animated, GestureResponderEvent, KeyboardAvoidingView, Pressable, PressableProps, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import FastImage, { ImageStyle } from "react-native-fast-image";
import { colors, defaultStyles, fonts, screenUnit, shadowStyles, styVals, textStyles } from "../HelperFiles/StyleSheet";
import CustomComponent from "./CustomComponent";
import LoadingCover from "./LoadingCover";
import { Coords, DefaultAddressData, AddressData, DeliveryMethod, OfferData } from "../HelperFiles/DataTypes";
import CustomModal from "./CustomModal";
import BloisPressable from "../BloisComponents/BloisPressable";
import User from "../HelperFiles/User";
import { AddressCard, CustomAddressInput, BloisTextButton, BloisTextInput, TextButton } from "../HelperFiles/CompIndex";
import { AntDesign, Entypo } from "@expo/vector-icons";
import MapView, { Circle, MapMarker, Marker, Overlay, PROVIDER_GOOGLE, Polygon } from "react-native-maps"
import Offer from "../HelperFiles/Offer";
import { hexToRGBA } from "../HelperFiles/ClientFunctions";
import Address from "../HelperFiles/Address";

type Props = {
    offerData: OfferData,
    defaultAddress?: AddressData
    showValidity?: boolean,
    onChange?: (address: AddressData, method: DeliveryMethod) => void
}

type State = {
    selection?: AddressData,
    addresses?: AddressData[],
    otherUserName: string,
    userCoords: Coords,
    meetupLocation: Coords,
    meetupSelection?: Coords,
    fromUserID?: string,
    toUserID?: string,
    showModal: boolean,
    selectType?: 'delivery' | 'ownAddress' | 'meetup' | 'createAddress'
    isLoading: boolean,
    errorMessage?: string
}


export default class ExchangeLocation extends CustomComponent<Props, State> {

    validity: Animated.Value;
    animationTime = 300;
    shadowColor: Animated.AnimatedInterpolation;
    shadowOpacity: Animated.AnimatedInterpolation;

    constructor(props: Props) {
        super(props)
        this.state = {
            selection: props.defaultAddress,
            addresses: undefined,
            otherUserName: User.getCurrent().uid === props.offerData.fromUserID ? props.offerData.toName : props.offerData.fromName,
            userCoords: {lat: 0, long: 0},
            meetupLocation: {lat: 0, long: 0},
            meetupSelection: undefined,
            showModal: true,
            selectType: undefined,
            isLoading: false,
            errorMessage: undefined
        }
        this.validity = new Animated.Value(1);
        this.shadowColor = this.validity.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.invalid, colors.black]
        })
        this.shadowOpacity = this.validity.interpolate({
            inputRange: [0, 1],
            outputRange: [1, shadowStyles.small.shadowOpacity]
        })
    }

    async refreshData() {
        try {
            this.setState({isLoading: true, errorMessage: undefined});
            const [addresses, userCoords] = await Promise.all([
                Address.getAddresses(),
                User.getLocation()
            ])
            this.setState({addresses: addresses, userCoords: userCoords})
        } catch(e) {
            this.handleError(e)
        }
        this.setState({isLoading: false});
    }

    animateValidate = () => {
        Animated.timing(this.validity, {
            toValue: 1,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    animateInvalidate = () => {
        Animated.timing(this.validity, {
            toValue: 0,
            duration: this.animationTime,
            useNativeDriver: false
        }).start()
    }

    renderAddress(address: AddressData) {
        return (
            <AddressCard
                addressData={address}
                style={{
                    shadowColor: this.state.selection && this.state.selection.name === address.name ? colors.valid : colors.black,
                    shadowOpacity: this.state.selection && this.state.selection.name === address.name ? 1 : shadowStyles.small.shadowOpacity
                }}
                showDirections
                onPress={() => {
                    this.setState({selection: address})
                    if (this.props.onChange) {
                        this.props.onChange(address, 'pickup');
                    }
                }}
                key={address.name}
            />
        )
    }

    renderDeliverySelection() {
        return (
            <>
                <Text
                    style={{
                        ...textStyles.medium,
                        color: colors.grey,
                        textAlign: 'left',
                        marginBottom: styVals.mediumPadding
                    }}
                >{`When ${this.state.otherUserName} receives this offer, they will be able to choose an exchange location. After they have chosen, you will confirm the location before accepting the exchange.`}
                </Text>
                {/* Confirm button */}
                <TextButton
                    text={`Confirm`}
                    textStyle={{color: colors.main}}
                    onPress={() => {
                        const newAddress: AddressData = {
                            ...DefaultAddressData,
                            userID: User.getCurrent().uid
                        }
                        this.setState({
                            showModal: false,
                            selectType: undefined,
                            selection: newAddress
                        }, () => {
                            if (this.props.onChange) {
                                this.props.onChange(newAddress, 'pickup')
                            }
                        })
                    }}
                />
            </>
        )
    }

    renderAddressSelection() {
        const addressSelected = this.state.selection && this.state.selection.streetAddress && this.state.selection.postalCode ? true : false;
        return this.state.addresses && !this.state.isLoading && !this.state.errorMessage ?
            <>
                {/* Addresses */}
                {this.state.addresses.map((address) => this.renderAddress(address))}
                {/* Create new address button */}
                <TextButton
                    text={`Create new address`}
                    onPress={() => {this.setState({selectType: 'createAddress'})}}
                />
                <TextButton
                    text={`Select this address`}
                    textStyle={{
                        color: addressSelected ? colors.black : colors.lightGrey
                    }}
                    onPress={() => {
                        if (addressSelected) {
                            if (this.props.onChange) {
                                this.props.onChange(this.state.selection!, 'pickup')
                            }
                            this.setState({showModal: false, selectType: undefined})
                        }
                    }}
                />
            </>
            /* Loading indictor */
            : <LoadingCover
                errorText={this.state.errorMessage}
                
                size={'large'}
                onErrorRefresh={() => this.refreshData()}
            />
    }

    renderAddressCreation() {
        return (
            <>
                {/* Street address */}
                <CustomAddressInput
                    onSave={async (address) => {
                        await Address.create(address)
                        // then
                        this.setState({selection: address, selectType: 'ownAddress'})
                        if (this.props.onChange) {
                            this.props.onChange(address, 'pickup');
                        }
                        this.refreshData()
                    }}
                />
            </>
        )
    }

    renderMeetupSelection() {
        return (
            <View>
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
                                meetupSelection: {
                                    lat: region.latitude,
                                    long: region.longitude
                                }
                            })
                        }}
                        initialRegion={{
                            latitude: this.state.meetupSelection?.lat || this.state.userCoords.lat,
                            longitude: this.state.meetupSelection?.long || this.state.userCoords.long,
                            latitudeDelta: 0.02,
                            longitudeDelta: 0.02
                        }}
                    >
                        {/* Recommended meetup area */}
                        <Circle
                            center={{
                                latitude: this.state.meetupLocation.lat,
                                longitude: this.state.meetupLocation.long
                            }}
                            radius={500}
                            strokeColor={"rgba(0,0,255,0.3)"}
                            fillColor={"rgba(0,0,255,0.15)"}
                        />
                        {/* Current exchange location pin */}
                        {this.state.selection ?
                        <MapMarker
                            coordinate={{latitude: this.state.selection.lat, longitude: this.state.selection.long}}
                            title={"Current exchange location"}
                            style={{height: styVals.largestTextSize*1.5*1.833}}
                        >
                            <Entypo
                                name="location-pin"
                                style={{
                                    fontSize: styVals.largestTextSize*1.5,
                                    color: colors.markerBlue,
                                    textAlign: 'center',
                                    textAlignVertical: 'bottom',
                                    alignSelf: 'center'
                                }}
                            />
                        </MapMarker>
                        : undefined}
                    </MapView>
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
                        <Entypo
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
                <Text style={{...textStyles.medium, color: colors.grey, textAlign: 'left', marginBottom: styVals.mediumPadding}}>The highlighted area is a recommended meetup area to reduce travel time for each of you.</Text>
                <BloisTextButton
                    text={"Select this meetup location"}
                    textStyle={{color: !this.state.meetupSelection ? colors.lightGrey : colors.black}}
                    touchableProps={{disabled: !this.state.meetupSelection}}
                    onPress={() => {
                        if (this.state.meetupSelection) {
                            const newDeliveryAddress: AddressData = {
                                ...DefaultAddressData,
                                name: 'Meetup',
                                lat: this.state.meetupSelection.lat,
                                long: this.state.meetupSelection.long
                            }
                            this.setState({selection: newDeliveryAddress}, () => {
                                if (this.props.onChange) {
                                    this.props.onChange(this.state.selection!, 'meetup')
                                }
                                this.setState({showModal: false, selectType: undefined})
                            })
                        }
                    }}
                />
            </View>
        )
    }

    renderSelection() {
        if (!this.state.selectType) {
            return (
                <>
                    {/* Deliver to other user button */}
                    <TextButton
                        text={`Deliver to ${this.state.otherUserName}`}
                        onPress={() => {this.setState({selectType: 'delivery'})}}
                    />
                    {/* Select address button */}
                    <TextButton
                        text={"Select an address"}
                        onPress={() => {this.setState({selectType: 'ownAddress'})}}
                    />
                    {/* Choose meetup location button */}
                    <TextButton
                        text={"Choose meetup location"}
                        onPress={() => {this.setState({selectType: 'meetup'})}}
                    />
                </>
            )
        } else if (this.state.selectType === 'delivery') {
            return this.renderDeliverySelection()
        } else if (this.state.selectType === 'ownAddress') {
            return this.renderAddressSelection()
        } else if (this.state.selectType === 'meetup') {
            return this.renderMeetupSelection()
        } else if (this.state.selectType === 'createAddress') {
            return this.renderAddressCreation()
        }
    }

    renderCard() {
        return (
        <BloisPressable
            style={{
                ...defaultStyles.roundedBox,
                ...shadowStyles.small,
                shadowColor: this.shadowColor,
                shadowOpacity: this.shadowOpacity,
                minHeight: styVals.largeHeight,
                justifyContent: 'flex-start',
                paddingVertical: styVals.minorPadding
            }}
            onPress={() => {
                this.setState({showModal: true})
            }}
        >
            <Text style={{...textStyles.large, marginBottom: styVals.mediumPadding}}>Exchange Location</Text>
            {this.state.selection && this.state.selection.lat !== 0 && this.state.selection.long !== 0
            ?
            /* Address */
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    width: '100%'
                }}
            >
                <View style={{flexDirection: 'column', justifyContent: 'space-evenly'}}>
                    {/* Name */}
                    <Text
                        style={{
                            ...textStyles.medium,
                            textAlign: 'left'
                        }}
                        numberOfLines={1}
                    >
                        {this.state.selection.name}
                    </Text>
                    {this.state.selection.streetAddress ?
                    <>
                        {/* Street address, postal code (pickup) */}
                        <Text style={{
                            ...textStyles.small,
                            textAlign: 'left',
                            color: colors.grey
                        }}>
                            {`${this.state.selection.streetAddress}, ${this.state.selection.apartment ? `Unit ${this.state.selection.apartment}, ` : ''}${this.state.selection.postalCode}`}
                        </Text>
                        {/* City, region, country (pickup) */}
                        <Text
                            style={{
                                ...textStyles.small,
                                textAlign: 'left',
                                color: colors.grey
                            }}
                            numberOfLines={1}
                        >
                            {`${this.state.selection.city}, ${this.state.selection.region ? `${this.state.selection.region}, ` : ''}${this.state.selection.country}`}
                        </Text>
                    </>
                    : /* Latitude and longitude (meetup) */
                    <>
                        <Text
                            style={{
                                ...textStyles.small,
                                textAlign: 'left',
                                color: colors.grey
                            }}
                            numberOfLines={1}
                        >
                            {this.state.selection.lat}
                        </Text>
                        <Text
                            style={{
                                ...textStyles.small,
                                textAlign: 'left',
                                color: colors.grey
                            }}
                            numberOfLines={1}
                        >
                            {this.state.selection.long}
                        </Text>
                    </>
                    }
                </View>
                {/* Map */}
                <MapView
                    style={{
                        ...defaultStyles.roundedBox,
                        ...shadowStyles.small,
                        width: styVals.largeHeight,
                        aspectRatio: 1
                    }}
                    region={{
                        latitude: this.state.selection.lat,
                        longitude: this.state.selection.long,
                        latitudeDelta: 0.001,
                        longitudeDelta: 0.001
                    }}
                    legalLabelInsets={{bottom: -1000, left: -1000, right: 0, top: 0}}
                >
                    {/* Current exchange location pin */}
                    <MapMarker
                        coordinate={{latitude: this.state.selection.lat, longitude: this.state.selection.long}}
                        title={"Current exchange location"}
                        style={{height: styVals.largestTextSize*1.833}}
                    >
                        <Entypo
                            name="location-pin"
                            style={{
                                fontSize: styVals.largestTextSize,
                                color: colors.markerBlue,
                                textAlign: 'center',
                                textAlignVertical: 'bottom',
                                alignSelf: 'center'
                            }}
                        />
                    </MapMarker>
                </MapView>
            </View>
            : /* Delivery */
            (this.state.selection ?
            <Text
                style={{
                    ...textStyles.small,
                    textAlign: 'left',
                    color: colors.grey
                }}
                numberOfLines={1}
            >
                A delivery location will be chosen by {this.state.otherUserName}.
            </Text>
            : /* Select button */
            <View
                style={{
                    ...defaultStyles.roundedBox,
                    ...shadowStyles.small,
                    width: undefined,
                    paddingVertical: styVals.minorPadding
                }}
            >
                <Text style={textStyles.medium}>Select</Text>
            </View>
            )
            }
        </BloisPressable>
        )
    }

    render() {
        if (this.props.showValidity) {
            if (this.state.selection) {
                this.animateValidate()
            } else {
                this.animateInvalidate()
            }
        }
        // Check if recommended meetup location has changed or doesn't exist, and get it
        if (this.props.offerData.fromUserID !== this.state.fromUserID
            || this.props.offerData.toUserID !== this.state.toUserID
            || this.state.meetupLocation.lat === 0
            || this.state.meetupLocation.long === 0
        ) {
            Offer.getMeetupLocation(this.props.offerData).then((coords) => {
                this.setState({
                    fromUserID: this.props.offerData.fromUserID,
                    toUserID: this.props.offerData.toUserID,
                    meetupLocation: coords
                })
            })
        }
        return (
            <>
            {this.renderCard()}
            {/* Selection modal */}
            <CustomModal
                visible={this.state.showModal}
                onClose={() => this.setState({showModal: false, selectType: undefined})}
            >
                <KeyboardAvoidingView
                    behavior={'padding'}
                    style={{
                        ...defaultStyles.roundedBox,
                        ...shadowStyles.small
                    }}
                >
                    <Text style={{...textStyles.large, marginBottom: styVals.mediumPadding}}>Exchange Location</Text>
                    {this.renderSelection()}
                </KeyboardAvoidingView>
            </CustomModal>
            </>
        )
    }
}