import React, { Component } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  StyleSheet,
  Modal,
  Button,
  Alert,
  PanResponder,
  Share,
} from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { baseUrl } from "../shared/baseUrl";
import { connect } from "react-redux";
import { postFavorite } from "../redux/ActionCreators";
import { postComment } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

const mapStateToProps = (state) => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites,
  };
};

const mapDispatchToProps = (dispatch) => ({
  postFavorite: (dishId) => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment, id) =>
    dispatch(postComment(dishId, rating, author, comment, id)),
});

function RenderDish(props) {
  const dish = props.dish;
  handleViewRef = (ref) => (this.view = ref);
  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if (dx < -200) return true;
    else return false;
  };
  const recognizeComment = ({ moveX, moveY, dx, dy }) => {
    if (dx > 200) return true;
    else return false;
  };
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
    },
    onPanResponderGrant: () => {
      this.view
        .rubberBand(1000)
        .then((endState) =>
          console.log(endState.finished ? "finished" : "cencelled")
        );
    },
    onPanResponderEnd: (e, gestureState) => {
      if (recognizeDrag(gestureState)) {
        Alert.alert(
          "Add to Favorites?",
          "Are you sure you wish to add " + dish.name + " to favorites?",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel pressed"),
              style: "cancel",
            },
            {
              text: "Ok",
              onPress: () =>
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress(),
            },
          ],
          { cancelable: false }
        );
      } else if (recognizeComment(gestureState)) {
        props.toggleModal();
      }
      return true;
    },
  });

  const shareDish = (title, message, url) => {
    Share.share(
      {
        title: title,
        message: title + ": " + message + " " + url,
        url: url,
      },
      {
        dialogTitle: "Share " + title,
      }
    );
  };

  if (dish != null) {
    return (
      <Animatable.View
        animation="fadeInDown"
        duration={2000}
        delay={1000}
        ref={this.handleViewRef}
        {...panResponder.panHandlers}
      >
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          <Text style={{ margin: 10 }}>{dish.description}</Text>

          <View style={styles.cardRow}>
            <Icon
              raised
              reverse
              name={props.favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              onPress={() =>
                props.favorite
                  ? console.log("Already favorite")
                  : props.onPress()
              }
            />
            <Icon
              raised
              reverse
              name="pencil"
              type="font-awesome"
              color="#512DA8"
              onPress={() => props.toggleModal()}
            />
            <Icon
              raised
              reverse
              name="share"
              type="font-awesome"
              color="#51D2A8"
              onPress={() =>
                shareDish(dish.name, dish.description, baseUrl + dish.image)
              }
            />
          </View>
        </Card>
      </Animatable.View>
    );
  } else {
    return <View></View>;
  }
}

function RenderComments(props) {
  const comments = props.comments;
  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Rating
          imageSize={10}
          readonly
          startingValue={item.rating}
          style={{ alignItems: "left" }}
        />
        <Text style={{ fontSize: 12 }}>
          {"--" + item.author + ", " + item.date}
        </Text>
      </View>
    );
  };
  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title="Comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => item.id.toString()}
        />
      </Card>
    </Animatable.View>
  );
}

class DishDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: 5,
      author: "",
      comment: "",
      showModal: false,
    };
  }

  markFavorite(dishId) {
    this.props.postFavorite(dishId);
  }

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleForm() {
    const dishId = this.props.navigation.getParam("dishId", "");
    this.props.postComment(
      dishId,
      this.state.rating,
      this.state.author,
      this.state.comment,
      this.props.comments.comments.length
    );
    this.toggleModal();
  }

  static navigationOptions = {
    title: "Dish Details",
  };

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");
    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          onPress={() => this.markFavorite(dishId)}
          favorite={this.props.favorites.some((el) => el === dishId)}
          toggleModal={() => this.toggleModal()}
        />
        <RenderComments
          comments={this.props.comments.comments.filter(
            (comment) => comment.dishId === dishId
          )}
        />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
        >
          <View style={styles.modal}>
            <Rating
              showRating
              onFinishRating={(rating) => this.setState({ rating: rating })}
              startingValue="5"
            />
            <Input
              placeholder="Author"
              containerStyle={{ margin: 10 }}
              leftIcon={
                <Icon
                  name="user"
                  size={24}
                  color="black"
                  type="font-awesome"
                  iconStyle={{ marginRight: 10 }}
                />
              }
              onChangeText={(value) => this.setState({ author: value })}
            />

            <Input
              placeholder="Comment"
              containerStyle={{ margin: 10 }}
              leftIcon={
                <Icon
                  name="comment"
                  size={24}
                  color="black"
                  type="font-awesome"
                  iconStyle={{ marginRight: 10 }}
                />
              }
              onChangeText={(value) => this.setState({ comment: value })}
            />

            <Button
              onPress={() => this.handleForm()}
              color="#512AD8"
              title="Submit"
            />
            <Button
              onPress={() => this.toggleModal()}
              color="grey"
              title="Close"
            />
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  cardRow: {
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

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);
