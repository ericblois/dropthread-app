import { MaterialIcons } from '@expo/vector-icons';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import CustomComponent from "./CustomComponents/CustomComponent";
import { alphanumericSpecialRegex, emailRegex, nameRegex, passwordRegex } from './CustomComponents/CustomTextInput';
import { capitalizeWords } from "./HelperFiles/ClientFunctions";
import { DateScrollPicker, LoadingCover, MenuBar, PageContainer, ScrollContainer, TextButton, TextDropdownAnimated, CustomTextInput, CustomTextButton } from "./HelperFiles/CompIndex";
import { geofire } from "./HelperFiles/Constants";
import { countriesList, Country, DefaultUserData, UserData, UserGender, UserGenders } from "./HelperFiles/DataTypes";
import { RootStackParamList } from "./HelperFiles/Navigation";
import { colors, icons, shadowStyles, styleValues, textStyles } from "./HelperFiles/StyleSheet";
import User from "./HelperFiles/User";

type UserSignupNavigationProp = StackNavigationProp<RootStackParamList, "userSignup">

type UserSignupRouteProp = RouteProp<RootStackParamList, "userSignup">;

type UserSignupProps = {
    navigation: UserSignupNavigationProp,
    route: UserSignupRouteProp
}

type State = {
    userData: Partial<UserData>,
    password?: string,
    passwordConfirm?: string,
    isLoading: boolean,
}


export default class UserSignupPage extends CustomComponent<UserSignupProps, State> {

    defaultTextInputProps: CustomTextInput['props'] = {
        autoCorrect: false,
        autoCapitalize: "none",
        clearButtonMode: "while-editing",
    }
    confirmInput: CustomTextInput | null = null

    constructor(props: UserSignupProps) {
        super(props)
        this.state = {
            userData: {},
            password: undefined,
            passwordConfirm: undefined,
            isLoading: false,
        }
    }

    async refreshData() {
        const location = await User.getLocation()
        const userData: Partial<UserData> = {
            ...this.state.userData,
            ...location
        }
        this.setState({userData: userData})
    }

    validateName(name?: string) {
        return name !== undefined && name.length > 0
    }
    validateEmail(email?: string) {
        return email !== undefined && /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.toLowerCase())
    }
    validatePass(password?: string) {
        return password !== undefined && password.length >= 6
    }
    validateConfirm(passwordConfirm?: string) {
        return passwordConfirm !== undefined && passwordConfirm === this.state.password
    }
    validateBirthday() {
        if (this.state.userData.birthYear === undefined ||
            this.state.userData.birthMonth === undefined || 
            this.state.userData.birthDay === undefined) {
                return false
        }
        const date = Date.parse(`${this.state.userData.birthYear}-${this.state.userData.birthMonth}-${this.state.userData.birthDay}`)
        // Get number of days between today and birthday
        const timeDiff = ((new Date()).getTime() - date)/(86400000);
        // Check if this birthday is more than 13 years old (365.24*13=4748.12)
        return timeDiff >= 4748.12
    }

    validateCoords() {
        if (this.state.userData.lat === undefined || this.state.userData.long === undefined) {
            return false
        }
        try {
            geofire.validateLocation([
                this.state.userData.lat,
                this.state.userData.long
            ])
            return true
        } catch (e) {
            return false
        }
    }

    validateInputs() {
        for (const key of Object.keys(DefaultUserData) as (keyof UserData)[]) {
            if (key === "userID" || key == 'region') {
                continue
            }
            if (this.state.userData[key] === undefined || this.state.userData[key] === "") {
                return false
            }
        }
        return (
            this.validateName() &&
            this.validateEmail() &&
            this.validatePass() &&
            this.validateConfirm() &&
            this.validateBirthday() &&
            this.validateCoords()
        )
    }

    async enter() {
        if (!this.validateInputs()) {
            throw new Error("Tried to create an account with invalid inputs.")
        }
        this.setState({isLoading: true})
        const userData: UserData = {
            ...DefaultUserData,
            ...this.state.userData,
        }
        // Create an account
        User.create(
            userData,
            this.state.password!
        ).then((cred) => {
            this.setState({isLoading: false}, () => {
                this.props.navigation.navigate("userMain")
            })
        }).catch((e) => {
            this.setState({isLoading: false})
            throw e
        })
    }

    renderInputs() {
        return (
            <ScrollContainer>
                {/* Name */}
                <CustomTextInput
                    {...this.defaultTextInputProps}
                    // Allow letters and quotes
                    allowedCharacters={nameRegex}
                    validateFunc={(text) => this.validateName(text)}
                    indicatorType={'shadowSmall'}
                    onChangeText={async (text) => this.setState({userData: {...this.state.userData, name: text} as UserData})}
                    placeholder={"Name"}
                    autoCapitalize={"words"}
                    textContentType={"name"}
                />
                {/* Email */}
                <CustomTextInput
                    {...this.defaultTextInputProps}
                    allowedCharacters={emailRegex}
                    indicatorType={'shadowSmall'}
                    validateFunc={(text) => this.validateEmail(text)}
                    onChangeText={(text) => this.setState({userData: {...this.state.userData, email: text} as UserData})}
                    placeholder={"Email"}
                    textContentType={"emailAddress"}
                />
                <Text style={styles.inputDescription}>
                    Use at least 6 characters in your password.
                </Text>
                {/* Password */}
                <CustomTextInput
                    {...this.defaultTextInputProps}
                    allowedCharacters={passwordRegex}
                    indicatorType={'shadowSmall'}
                    validateFunc={(text) => this.validatePass(text)}
                    onChangeText={(text) => {
                        this.setState({password: text})
                        if (!this.validateConfirm(this.state.passwordConfirm) && this.state.passwordConfirm && this.state.passwordConfirm.length > 0) {
                            this.confirmInput?.animateInvalidate()
                        } else {
                            this.confirmInput?.animateValidate()
                        }
                    }}
                    placeholder={"Password"}
                    textContentType={"newPassword"}
                    secureTextEntry={true}
                />
                {/* Confirm password */}
                <CustomTextInput
                    {...this.defaultTextInputProps}
                    allowedCharacters={passwordRegex}
                    ref={(textInput) => {this.confirmInput = textInput}}
                    indicatorType={'shadowSmall'}
                    validateFunc={(text) => this.validateConfirm(text)}
                    onChangeText={(text) => this.setState({passwordConfirm: text})}
                    placeholder={"Confirm password"}
                    textContentType={"newPassword"}
                    secureTextEntry={true}
                />
                <Text style={styles.inputDescription}>
                    You must be 13 years of age or older to use this service.
                </Text>
                {/* Birth date */}
                <DateScrollPicker
                    pickerStyle={{
                        borderColor: this.validateBirthday() ? colors.valid : colors.invalid,
                        borderWidth: styleValues.minorBorderWidth
                    }}
                    onDateChange={(date) => this.setState({userData: {
                            ...this.state.userData,
                            birthDay: date.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2}),
                            birthMonth: (date.getMonth() + 1).toLocaleString('en-US', {minimumIntegerDigits: 2}),
                            birthYear: date.getFullYear().toLocaleString('en-US', {minimumIntegerDigits: 4, useGrouping: false})
                    }})}
                ></DateScrollPicker>
                {/* Gender */}
                <TextDropdownAnimated
                    items={UserGenders.map((gender) => ({
                        text: capitalizeWords(gender),
                        value: gender
                    }))}
                    placeholderText={"Gender"}
                    enableMultiple={false}
                    showValidSelection={true}
                    onSelect={(selections) => this.setState({userData: {...this.state.userData, gender: selections[0].value as UserGender} as UserData})}
                />
                { /* Country */}
                <TextDropdownAnimated
                    items={countriesList.map((country) => ({
                        text: capitalizeWords(country),
                        value: country
                    }))}
                    placeholderText={"Country"}
                    enableMultiple={false}
                    showValidSelection={true}
                    onSelect={(selections) => this.setState({userData: {...this.state.userData, country: selections[0].value as Country} as UserData})}
                />
                <Text style={{...styles.inputDescription, fontSize: styleValues.smallestTextSize}}>Your location is required to view items near you. Location data is never shared with other users without your permission.</Text>
                <CustomTextButton
                    text={"Location"}
                    wrapperStyle={{
                        width: '100%'
                    }}
                    buttonStyle={{
                        borderColor: this.validateCoords() ? colors.valid : colors.invalid,
                        borderWidth: styleValues.minorBorderWidth
                    }}
                    rightChildren={
                        <MaterialIcons
                            name={'my-location'}
                            style={{
                                color: this.validateCoords() ? colors.valid : colors.invalid,
                                fontSize: styleValues.largeTextSize
                            }}
                        />
                    }
                    onPress={() => this.refreshData()}
                />
                <Text style={styles.inputDescription}>Terms of Service</Text>
            </ScrollContainer>
        )
    }

    renderLoading() {
        if (this.state.isLoading) {
            return (
                <LoadingCover size={"large"}/>
            )
        }
    }
    
    render() {
        return (
        <PageContainer
            headerText={'Sign Up'}
        >
            {this.renderInputs()}
            {this.renderLoading()}
            <MenuBar
                buttonProps={[
                    {
                        iconSource: icons.chevron,
                        onPress: () => this.props.navigation.goBack(),
                    },
                    {
                        iconSource: icons.enter,
                        iconStyle: {tintColor: this.validateInputs() ? colors.darkGrey : colors.lighterGrey},
                        showLoading: true,
                        onPress: () => this.enter(),
                        buttonProps: {
                            // When enter is disabled, don't change opacity when pressed
                            disabled: !this.validateInputs(),
                        }
                    }
                ]}
            ></MenuBar>
        </PageContainer>
        );
    }
}

const styles = StyleSheet.create({
    inputDescription: {
        ...textStyles.smallerHeader,
        color: colors.grey,
        width: "100%",
        textAlign: "left",
    },
})