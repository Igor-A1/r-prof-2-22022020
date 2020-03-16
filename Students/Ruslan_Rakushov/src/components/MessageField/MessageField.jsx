//TODO Поиск по сообщениям
//TODO Удаление сообщение

import React, { Component } from 'react';
import ReactDom from 'react-dom';

//redux
import { bindActionCreators } from 'redux';
import connect from 'react-redux/es/connect/connect';
import { sendMessage } from '../../store/actions/messageActions.js';

import Message from '../Message/Message.jsx';

//UI Components
import { withStyles } from '@material-ui/core/styles';
import {IconButton, TextField, Tooltip } from '@material-ui/core';
import SendOutlinedIcon from '@material-ui/icons/SendOutlined';

const useStyles = (theme => ({
  wrapper: {
    width: '70vh',
    marginTop: '70px',
    // TODO height 70vh (в body или верхний контейнер 100vh,
    //  дальше вложенным делаем свои или 100.
    //  еще можно футером прибить (см.какое-то свойство css)
  },
  root: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '75vh',
    padding: '5px',
    border: '1px solid grey',
    borderRadius: '5px',
    backgroundColor: 'lightgrey',
    boxSizing: 'border-box',
    overflowY: 'auto',
  },
  sendMsgField: {
    width: '400px',
    margin: '10px 0px',
    display: 'flex',
  },
  sendText: {
    width: 'inherit',
  },
  sendBtn: {
    padding: '8px',
  },
}));

class MessageField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      msgText: '',
    };
    this.msgTextInput = React.createRef()
    this.messageFieldEndRef = React.createRef();
  }
  //methods
  handleSendMsg = (message, sender) => {
    const {msgs, currentChatId} = this.props;
    const msgId = Object.keys(msgs).length + 1;
    //FIX Выпилить расчет id в reducer - это дело хранилища/апи/бд
    this.props.sendMessage(msgId, sender, message, currentChatId);
    this.setState({
      msgText: '',
    });
  };
  handleChange = (evt) => {
    if (evt.keyCode === 13) {
      this.handleSendMsg(evt.target.value, 'Me');
    } else {
      this.setState({ [evt.target.name]: evt.target.value });
    }
  };
  scrollToBottom = () => {
    if (this.messageFieldEndRef.current.lastElementChild) {
      this.messageFieldEndRef.current.lastElementChild.scrollIntoView({ behavior: 'smooth' });
    }
  };
  setFocusOnInput = () => {
    if (this.msgTextInput.current) {
      this.msgTextInput.current.focus();
    }
  }
  
  getLastMsgInChat(chatId, msgsObj) {
    for (let i = Object.keys(msgsObj).length; i > 0; i--) {
      if (msgsObj[i].chatId === chatId) {
        return msgsObj[i];
      }
    }
  }
  getAllMsgsInChat(chatId, msgsObj) {
    const msgsArr = [];
    // for (let i = 1; i <= Object.keys(msgsObj).length; i++) {
    //   if (msgsObj[i].chatId === chatId) {
    //     msgsArr.push(msgsObj[i]);
    //   }
    // }
    //lets try smth else =)
    for (let i in msgsObj) {
      if (msgsObj.hasOwnProperty(i) && msgsObj[i].chatId === chatId) {
        msgsArr.push(msgsObj[i]);
      }
    }
    return msgsArr;
  }

  //hooks
  componentDidMount() {
    this.scrollToBottom();
    this.setFocusOnInput();
  };

  componentDidUpdate(prevProps, prevState) {
    this.scrollToBottom();
    this.setFocusOnInput();
  };

  render() {
    const { classes } = this.props;
    const { msgs, currentChatId } = this.props;
    const currentChatMsgs = this.getAllMsgsInChat(currentChatId, msgs);
    let MessagesArr = [];
    if (currentChatMsgs.length) {
      MessagesArr = currentChatMsgs.map((msg, index) => (
        <Message key={index.toString()} msg={msg} />
      ));
    } else {
      MessagesArr = (
        <span>Сообщений пока нет...</span>
      );
    }
    return (
      <div className={classes.wrapper}>
        <div className={classes.root} ref={this.messageFieldEndRef}>
          { MessagesArr }
        </div>
        <div className={classes.sendMsgField}>
          <TextField
            //TODO use ui prop autoFocus
            placeholder = 'Введите сообщение...'
            inputRef = {this.msgTextInput}
            className = {classes.sendText}
            variant = "outlined"
            size = "small"
            onChange = {this.handleChange}
            onKeyUp = {this.handleChange}
            value = {this.state.msgText}
            name = 'msgText'
            />
          <Tooltip title="Отправить">
            <IconButton 
              className={classes.sendBtn}
              // size="small"
              name="sendMsgUI"
              onClick={() => this.handleSendMsg(this.state.msgText, 'Me')}>
                <SendOutlinedIcon />
              </IconButton>
          </Tooltip>
        </div>
      </div>
    );
  }
}

const mapStateToProps = ({ messageReducer, chatReducer }) => ({
  msgs: messageReducer.msgs,
  chats: chatReducer.chats,
  currentChatId: chatReducer.currentChatId,
});

const mapDispatchToProps = dispatch => bindActionCreators({
  sendMessage,
}, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(useStyles)(MessageField));