import React, { Component } from "react";
import {
  Text,
  View,
  ScrollView,
  StyleSheet,
  Picker,
  Switch,
  Button,
  Modal,
  Alert,
} from "react-native";
import { Card } from "react-native-elements";
import DatePicker from "react-native-datepicker";
import * as Animatable from "react-native-animatable";
import { Notifications } from "expo";
import * as Permissions from "expo-permissions";
import * as Calendar from "expo-calendar";

class Reservation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      guests: 1,
      smoking: false,
      date: "",
      showModal: false,
      calendarId: "",
    };
  }

  static navigationOptions = {
    title: "Reserve Table",
  };

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleReservation() {
    //console.log(JSON.stringify(this.state));
    //this.toggleModal();
    this.createCalendarEvent(this.state.date);
    Alert.alert(
      "Your reservation OK?",
      "Number of guests: " +
        this.state.guests +
        "\nSmoking? " +
        this.state.smoking +
        "\nDate and Time: " +
        this.state.date,
      [
        {
          text: "Cancel",
          onPress: () => this.resetForm(),
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            this.presentLocalNotification(this.state.date);
            this.resetForm();
          },
        },
      ],
      { cancelabel: false }
    );
  }

  resetForm() {
    this.toggleModal();
    this.setState({
      guests: 1,
      smoking: false,
      date: "",
    });
  }

  async obtainNotificationPermission() {
    let permission = await Permissions.getAsync(
      Permissions.USER_FACING_NOTIFICATIONS
    );
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(
        Permissions.USER_FACING_NOTIFICATIONS
      );
      if (permission.status !== "granted") {
        Alert.alert("Permission not granted to show notifications");
      }
    }
    return permission;
  }

  async presentLocalNotification(date) {
    await this.obtainNotificationPermission();
    Notifications.presentLocalNotificationAsync({
      title: "Your reservation",
      body: "Reservation for " + date + " requsted",
      ios: {
        sound: true,
      },
      android: {
        sound: true,
        vibrate: true,
        color: "#512DA8",
      },
    });
  }

  async obtainCalendarPermission() {
    let permission = await Permissions.getAsync(Permissions.CALENDAR);
    if (permission.status !== "granted") {
      permission = await Permissions.askAsync(Permissions.CALENDAR);
      if (permission.status !== "granted") {
        Alert.alert("Permission not granted to show notifications");
      }
    }
    return permission;
  }

  async getDefaultCalendarSource() {
    const calendars = await Calendar.getCalendarsAsync();
    const defaultCalendars = calendars.filter(
      (each) => each.source.name === "Default"
    );
    console.log(calendars);
    return defaultCalendars[0].source;
  }

  async createCalendarEvent(date) {
    let granted = await this.obtainCalendarPermission();
    if (granted) {
      const defaultCalendarSource =
        Platform.OS === "ios"
          ? await this.getDefaultCalendarSource()
          : { isLocalAccount: true, name: "Expo Calendar" };
      const newCalendarID = await Calendar.createCalendarAsync({
        title: "Expo Calendar",
        color: "blue",
        entityType: Calendar.EntityTypes.EVENT,
        sourceId: defaultCalendarSource.id,
        source: defaultCalendarSource,
        name: "internalCalendarName",
        ownerAccount: "personal",
        accessLevel: Calendar.CalendarAccessLevel.OWNER,
      });
      console.log(`Your new calendar ID is: ${newCalendarID}`);

      Calendar.createEventAsync(newCalendarID, {
        title: "Table Reservation",
        startDate: new Date(Date.parse(date)),
        endDate: new Date(Date.parse(date) + 2 * 60 * 60 * 1000),
        location:
          "121, Clear Water Bay Road, Clear Water Bay, Kowloon, Hong Kong",
        timeZone: "Asia/Hong_Kong",
      });
      Alert.alert("added to calendar!");
    } else Alert.alert("no permission for calendar!");
  }

  render() {
    return (
      <ScrollView>
        <Animatable.View animation="zoomIn" duration={2000}>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Number of guests</Text>
            <Picker
              selectedValue={this.state.guests}
              style={styles.formItem}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ guests: itemValue })
              }
            >
              <Picker.Item label="1" value="1" />
              <Picker.Item label="2" value="2" />
              <Picker.Item label="3" value="3" />
              <Picker.Item label="4" value="4" />
              <Picker.Item label="5" value="5" />
              <Picker.Item label="6" value="6" />
            </Picker>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Smoking area</Text>
            <Switch
              style={styles.formItem}
              value={this.state.smoking}
              onTintColor="#512DA8"
              onValueChange={(value) => this.setState({ smoking: value })}
            ></Switch>
          </View>
          <View style={styles.formRow}>
            <Text style={styles.formLabel}>Date and Time</Text>
            <DatePicker
              style={{ flex: 2, marginRight: 20 }}
              date={this.state.date}
              format=""
              mode="datetime"
              placeholder="select date and time"
              minDate="2020-01-01"
              confirmBtnText="Confirm"
              cancelBtnText="Cancel"
              customStyles={{
                dateIcon: {
                  position: "absolute",
                  left: 0,
                  top: 4,
                  marginLeft: 0,
                },
                dateInput: {
                  marginLeft: 36,
                },
              }}
              onDateChange={(date) => {
                this.setState({ date: date });
              }}
            />
          </View>
          <View style={styles.formRow}>
            <Button
              title="Reserve"
              color="#512DA8"
              onPress={() => this.handleReservation()}
              accessibilityLabel="Learn more about this purple button"
            />
          </View>
        </Animatable.View>
        {/* <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={() => {
            this.toggleModal();
            this.resetForm();
          }}
          onRequestClose={() => {
            this.toggleModal();
            this.resetForm();
          }}
        >
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Your reservation</Text>
            <Text style={styles.modalText}>
              Number of guests: {this.state.guests}
            </Text>
            <Text style={styles.modalText}>
              Smoking? : {this.state.smoking ? "Yes" : "No"}
            </Text>
            <Text style={styles.modalText}>
              Date and Time: {this.state.date}
            </Text>
            <Button
              onPress={() => this.resetForm()}
              color="#512AD8"
              title="Close"
            />
          </View>
        </Modal> */}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20,
  },
  formLabel: {
    fontSize: 18,
    flex: 2,
  },
  formItem: {
    flex: 1,
  },
  modal: {
    justifyContent: "center",
    margin: 20,
    paddingTop: 15,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#512DA8",
    textAlign: "center",
    color: "white",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    margin: 10,
  },
});

export default Reservation;
